CanvasKit._extraInitializations = CanvasKit._extraInitializations || [];
CanvasKit._extraInitializations.push(function () {
  CanvasKit.MakePDFDocument = function (metadata) {
    let pdfMetadata = initPDFMetadata(metadata);
    let doc = CanvasKit._MakePDFDocument(pdfMetadata);
    if (pdfMetadata._rootTag) {
      pdfMetadata._rootTag.delete();
    }
    return doc;
  };

  CanvasKit.Document.prototype.beginPage = function (width, height, rect) {
    let rPtr = copyRectToWasm(rect);
    return this._beginPage(width, height, rPtr);
  };

  function copyAttribute(tag, source) {
    let owner = cacheOrCopyString(source["owner"] || "");
    let name = cacheOrCopyString(source["name"] || "");
    if (source["type"] === "name") {
      tag.appendNameAttribute(
        owner,
        name,
        cacheOrCopyString(source["value"] || ""),
      );
    } else if (source["type"] === "int") {
      tag.appendIntAttribute(owner, name, source["value"] || 0);
    } else if (source["type"] === "float") {
      tag.appendFloatAttribute(owner, name, source["value"] || 0.0);
    } else {
      throw new Error("PDFTagAttribute: Unknown type: " + source["type"]);
    }
  }

  function initPDFTag(source) {
    if (!source) {
      return null;
    }
    let pdftag = CanvasKit._PDFTagNode.Make();
    pdftag.setNodeId(source["id"] || 0);
    pdftag.setTypeString(source["type"] || "NonStruct");
    pdftag.setAlt(source["alt"] || "");
    pdftag.setLang(source["language"] || "");
    source["attributes"] = source["attributes"] || [];
    for (let i = 0; i < source["attributes"].length; i++) {
      copyAttribute(pdftag, source["attributes"][i]);
    }
    source["children"] = source["children"] || [];
    for (let i = 0; i < source["children"].length; i++) {
      pdftag.appendChild(initPDFTag(source["children"][i]));
    }
    return pdftag;
  }

  function initPDFMetadata(metadata) {
    metadata = metadata || {};
    metadata["title"] = metadata["title"] || "";
    metadata["author"] = metadata["author"] || "";
    metadata["subject"] = metadata["subject"] || "";
    metadata["keywords"] = metadata["keywords"] || "";
    metadata["creator"] = metadata["creator"] || "";
    metadata["producer"] = metadata["producer"] || "";
    metadata["language"] = metadata["language"] || "";
    metadata["rasterDPI"] = metadata["rasterDPI"] || 72;
    metadata["PDFA"] = !!metadata["PDFA"];
    metadata["compressionLevel"] =
      metadata["compressionLevel"] || CanvasKit.PDFCompressionLevel.Default;
    metadata["_rootTag"] = metadata["rootTag"]
      ? metadata["_rootTag"] || initPDFTag(metadata["rootTag"])
      : null;

    return metadata;
  }

  let stringCache = {};

  function cacheOrCopyString(str) {
    if (stringCache[str]) {
      return stringCache[str];
    }
    let strLen = lengthBytesUTF8(str) + 1;
    let strPtr = CanvasKit._malloc(strLen);
    stringToUTF8(str, strPtr, strLen);
    stringCache[str] = strPtr;
    return strPtr;
  }
});
