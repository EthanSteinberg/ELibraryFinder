other_libraries = [
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

const currentUrl = new URL(window.location.href);

const path = currentUrl.pathname;
const parts = path.split("/");

const mediaName = parts[2];

const libraryData = [];

function makeUrl(library) {
    return "https://" + library + ".overdrive.com/media/" + mediaName;
}

for (const library of other_libraries) {
    libraryData.push(fetch(makeUrl(library)).then(request => getInfo(library, request)));
}

function getInfo(library, request) {
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

Promise.all(libraryData).then(data => {
    const librariesAvailable = [];
    const librariesHold = [];

    for (const item of data) {

        if (item['isAvailable']) {
            librariesAvailable.push(item);
        } else if (item['isOwned']) {
            librariesHold.push(item);
        }
    }

    librariesAvailable.sort((a, b) => {
        return b['availableCopies'] - a['availableCopies'];
    });

    librariesHold.sort((a, b) => {
        return a['estimatedWaitDays'] - b['estimatedWaitDays'];
    });

    const locationToInject = document.getElementsByClassName('title-page__wrapper')[0];

    if (librariesAvailable.length > 0) {
        const availableLines = librariesAvailable.map(a => {
            return `<a href="${makeUrl(a['library'])}"> ${a['library']} With ${a['availableCopies']} Available</a>`
        });
        const content = `
            <h3 class="folding-panel__label folding-panel__disabled">Available For Borrowing</h3>
            <div class="folding-panel__content">
                ${availableLines.join('\n<br>\n')}
            </div>
        `;
        locationToInject.insertAdjacentHTML('beforeend', content);
    }

    if (librariesHold.length > 0) {
        const availableLines = librariesHold.map(a => {
            return `<a href="${makeUrl(a['library'])}"> ${a['library']} With ${a['estimatedWaitDays']} Days Wait</a>`
        });
        const content = `
            <h3 class="folding-panel__label folding-panel__disabled">Available for Hold</h3>
            <div class="folding-panel__content">
                ${availableLines.join('\n<br>\n')}
            </div>
        `;
        locationToInject.insertAdjacentHTML('beforeend', content);
    }
});