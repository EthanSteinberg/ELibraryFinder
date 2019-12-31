function getData(mediaName) {

  const other_libraries = [
      "sdcl",
      "lapl",
      "nypl",
      "ncdl",
      "saclibrary",
      "berkeleypubliclibrary",
      "ocls",
      "ald",
      "scdl",
      "lbpl",
      "sanjose",
      "santaclara",
      "iedigital",
      "pas-gdl",
      "kern",
      "burbank",
      "pls",
      "blackgold",
      "santamonica",
      "sfpl",
      "sbcldigital",
      "oakland",
      "rml",
      "tolibrary",
      "santaclarita",
      "bhpl",
      "palmspringslibrary",
  ];

  const libraryData = [];

  function makeUrl(library) {
      return "https://" + library + ".overdrive.com/media/" + mediaName;
  }

  for (const library of other_libraries) {
      libraryData.push(fetch(makeUrl(library)).then(request => getInfo(library, request)));
  }

  function getInfo(library, request) {
      if (request.status != 200) {
          return null;
      }
      return request.text().then(text => {
          const lines = text.split("\n");
          for (const line of lines) {
              if (line.startsWith('            window.OverDrive.mediaItems')) {
                  const firstEquals = line.indexOf('=');
                  const last = line.lastIndexOf(';');
                  const data = line.substring(firstEquals + 1, last);
                  const result = JSON.parse(data);
                  const keys = Object.keys(result);
                  const actualResult = result[keys[0]];
                  actualResult['library'] = library;
                  return actualResult;
              }
          }

          console.error("NO SUCH DATA");
          debugger;
      });
  }

  return Promise.all(libraryData);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    getData(request).then(data => {
      sendResponse(data);
    });

    return true;
  });
