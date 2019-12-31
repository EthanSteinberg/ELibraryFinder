const currentUrl = new URL(window.location.href);

function makeUrl(library) {
    return "https://" + library + ".overdrive.com/media/" + mediaName;
}

const path = currentUrl.pathname;
const parts = path.split("/");

const mediaName = parts[2];

chrome.runtime.sendMessage(mediaName, data => {
    const librariesAvailable = [];
    const librariesHold = [];

    for (const item of data) {
        if (item != null) {
            if (item['isAvailable']) {
                librariesAvailable.push(item);
            } else if (item['isOwned']) {
                librariesHold.push(item);
            }
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