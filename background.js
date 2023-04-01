function getData(mediaName) {

  const other_libraries = ["lapl", "sunnyvale", "camdigital", "palmspringslibrary", "sanjose", "burbank", "sdcl", "salinaspubliclibrary", "rml", "sbcldigital", "tolibrary", "santabarbara", "bhpl", "ncdl", "marinet", "santaclarita", "blackgold", "scdl", "slolibrary", "sfpl", "emcfl", "carmel", "kern", "berkeleypubliclibrary", "lacountylibrary", "lbpl", "northnet", "ocpl", "pls", "saclibrary", "sonoma", "santaclara", "iedigital", "nypl", "oakland", "alhambralibrary"];

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
              if (line.startsWith('    window.OverDrive.mediaItems')) {
                  const firstEquals = line.indexOf('=');
                  const last = line.lastIndexOf(';');
                  const data = line.substring(firstEquals + 1, last);
                  console.log("Got data", data);
                  const result = JSON.parse(data);
                  if (!result) {
                    return result;
                  } else {
                    console.log(result);
                    const keys = Object.keys(result);
                    const actualResult = result[keys[0]];
                    actualResult['library'] = library;
                    return actualResult;
                  }
              }
          }

          console.log("NO SUCH DATA");
          // debugger;
          return null;
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
