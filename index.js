//global class
//Card class declaration and constructor
class Card {
    cardId; //card id - 8 digit int
    name; //card name
    type; //type of card
    desc; //description of card or card effect
    atk = undefined; //attack point statline, NOTE that spells, traps do not have this stat
    def = undefined; //defense point statline, NOTE that spells, traps, links, do not have stat
    level = undefined; // card level (when applicable), NOTE that spells, traps, links, and XYZ do not have levels
    race; //race of card, for spell/trap this describes the type of spell/trap they are 
    attribute = undefined; //attribute, does not apply to spell/trap
    imageUrl;// image url to grab from site, NOT FROM GOOGLE SERVER, else blacklist
    owned;
    constructor(cardId, name, type, desc, atk, def, level, race, attribute, imageUrl, owned) {
        this.cardId = cardId; this.name = name; this.type = type; this.desc = desc; this.atk = atk; this.def = def; this.level = level; this.race = race; this.attribute = attribute; this.imageUrl = imageUrl, this.owned = owned;
    }
}

//global variables
let currDeck = ''; //name of current deck
let mainDeck = []; //empty array to hold main deck
let extraDeck = []; //empty array to hold extra deck
let sideDeck = []; //empty array to hold side deck
let listDecks = []; //empty array to hold the list of deck names from db, will use to fill form options
//card currently held in the card viewer
let displayCard = { deckName: '', obj: '' };
let numCards = 0;
let numCardsOwned = 0;

//results page shit
let results = []; //empty results array
let totalPages = 0;
let currPage = 0;

//get urls for Yu-Gi-Oh! Prodeck API
const apiBaseUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?';
const urlCardName = `${apiBaseUrl}name=`;
const urlCardId = `${apiBaseUrl}id=`;
const urlSearch = `${apiBaseUrl}fname=`;
const baseUrlImg = 'https://ygoprodeck.com/pics/';
const decksUrl = 'http://localhost:3000/decks';

//grab elements
const mainDeckBuilder = document.querySelector('.main-deck-builder');
const extraDeckBuilder = document.querySelector('.extra-deck-builder');
const sideDeckBuilder = document.querySelector('.side-deck-builder');
const cardViewImg = document.querySelector('#selected-card-img');
const cardViewName = document.querySelector('#select-card-name');
const cardViewAttributes = document.querySelector('#select-card-attributes');
const cardStats = document.querySelector('#select-card-stats');
const cardEffects = document.querySelector('#select-card-effects');
const deckForm = document.querySelector('#deck-form');
const cardMarketPrice = document.querySelector('#cardmarket-price');
const tcgPlayerPrice = document.querySelector('#tcgplayer-price');
const ebayPrice = document.querySelector('#ebay-price');
const ownedBtn = document.querySelector("#selected-card-info > button");
const searchBar = document.querySelector('#card-search-bar');
const prevBtn = document.querySelector('#left-button');
const nextBtn = document.querySelector('#right-button');
const saveBtn = document.querySelector('#save-btn')
const sortBtn = document.querySelector('#sort-btn');
const deleteBtn = document.querySelector('#delete-btn');


//API CALL: fetch request to search by card's name
const fetchByName = async (cardName) => {
    //request from api
    let req = await fetch(`${urlCardName}${cardName}`);
    //get response back as json
    let res = await req.json();
    //return response, JUST THE CARD INFORMATION
    return res['data']['0'];
}

//API CALL: fetch request to search by card's ID
const fetchById = async (cardId) => {
    //request from api
    let req = await fetch(`${urlCardId}${cardId}`);
    //get response back as json
    let res = await req.json();
    //return response, JUST THE CARD INFORMATION
    return res['data']['0'];
}

const fetchSearch = async (cardName) => {
    //request form api
    let req = await fetch(`${urlSearch}${cardName}`);
    //get response back as json
    let res = await req.json();
    //return response, JUST THE CARD INFORMATION
    return res['data'];
}

//DB CALL: fetch list of deck names
const fetchListDecks = async () => {
    let req = await fetch(decksUrl);
    let res = await req.json();
    return Object.keys(res);
}

//DB CALLL: fetch deck information 
const fetchDeck = async (deckName) => {
    let req = await fetch(decksUrl);
    let res = await req.json();
    return res[`${deckName}`];
}

//initalize deck name to first from db
const initalizeDeck = async () => {
    const arrayOfNames = await fetchListDecks()
    currDeck = arrayOfNames[0];
}

//fill up deck arrays
const populateDecks = async (foo) => {
    await foo();
    let deckList = await fetchDeck(currDeck);
    mainDeck = deckList.mainDeck;
    extraDeck = deckList.extraDeck;
    sideDeck = deckList.sideDeck;
    renderMainDeck();
    renderExtraDeck();
    renderSideDeck();
}

const getPrices = async (cardId) => {
    let cardInfo = await fetchById(cardId);
    let prices = [cardInfo.card_prices[0].cardmarket_price, cardInfo.card_prices[0].tcgplayer_price, cardInfo.card_prices[0].ebay_price]
    return prices;
}

//render main deck
const renderMainDeck = () => {
    //clear out builder
    mainDeckBuilder.innerHTML = '';
    mainDeck = sortDeck(mainDeck)
    if (mainDeck.length > 40 && mainDeck.length <= 50) {
        mainDeckBuilder.classList.remove('deck-ct-40');
        mainDeckBuilder.classList.add('deck-ct-50');
    } else if (mainDeck.length > 40 && mainDeck.length <= 60) {
        mainDeckBuilder.classList.remove('deck-ct-40');
        mainDeckBuilder.classList.add('deck-ct-60');
    } else {
        mainDeckBuilder.classList.remove('deck-ct-50');
        mainDeckBuilder.classList.remove('deck-ct-60');
        mainDeckBuilder.classList.add('deck-ct-40');
    }

    //iterate througha array and append
    mainDeck.forEach(something => {
        let tempCard = document.createElement('img');
        numCards++;
        if (something.owned === true) {
            numCardsOwned++;
        }
        tempCard.addEventListener('contextmenu', (e) => {
            numCards--;
            if (something.owned === true) {
                numCardsOwned--;
            }
            e.preventDefault()
            mainDeck.splice(mainDeck.indexOf(something), 1)
            tempCard.remove()
        })
        tempCard.addEventListener('click', async () => {
            displayCard.deck = 'mainDeck';
            displayCard.obj = something;
            cardViewImg.src = tempCard.src
            if (something.type === "Spell Card" || something.type === "Trap Card") {
                cardStats.textContent = ''
            } else if (something.type === "Link Monster") {
                cardStats.textContent = `ATK/${something.atk}`
            } else {
                cardStats.textContent = `ATK/${something.atk} DEF/${something.def}`
            }
            cardViewName.textContent = something.name
            cardViewAttributes.textContent = `[${something.race}/${something.type.split(' ')[0]}]`
            cardEffects.textContent = something.desc
            let prices = await getPrices(something.cardId);
            cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
            tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
            ebayPrice.textContent = `Ebay:$${prices[2]}`;
            if (something.owned === true) {
                ownedBtn.style.backgroundColor = '#007500';
                ownedBtn.textContent = 'Owned';
            }
            else {
                ownedBtn.style.backgroundColor = '#ff0000';
                ownedBtn.textContent = 'Not Owned';
            }
        })
        tempCard.classList.add('builder-img');
        tempCard.src = something['imageUrl'];
        mainDeckBuilder.append(tempCard);
    })
}

//render extra deck
const renderExtraDeck = () => {
    //iterate througha array and appen
    extraDeckBuilder.innerHTML = '';
    extraDeck = sortDeck(extraDeck)
    extraDeck.forEach(something => {
        numCards++;
        if (something.owned === true) {
            numCardsOwned++;
        }
        let tempCard = document.createElement('img');
        tempCard.addEventListener('contextmenu', (e) => {
            numCards--;
            if (something.owned === true) {
                numCardsOwned--;
            }
            e.preventDefault()
            extraDeck.splice(extraDeck.indexOf(something), 1)
            tempCard.remove()
        })
        tempCard.addEventListener('click', async () => {
            displayCard.deck = 'extraDeck';
            displayCard.obj = something;
            cardViewImg.src = tempCard.src
            if (something.type === "Spell Card" || something.type === "Trap Card") {
                cardStats.textContent = ''
            } else if (something.type === "Link Monster") {
                cardStats.textContent = `ATK/${something.atk}`
            } else {
                cardStats.textContent = `ATK/${something.atk} DEF/${something.def}`
            }
            cardViewName.textContent = something.name
            cardViewAttributes.textContent = `[${something.race}/${something.type.split(' ')[0]}]`
            cardEffects.textContent = something.desc
            let prices = await getPrices(something.cardId);
            cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
            tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
            ebayPrice.textContent = `Ebay:$${prices[2]}`;
            if (something.owned === true) {
                ownedBtn.style.backgroundColor = '#007500';
                ownedBtn.textContent = 'Owned';
            }
            else {
                ownedBtn.style.backgroundColor = '#ff0000';
                ownedBtn.textContent = 'Not Owned';
            }
        })

        tempCard.classList.add('builder-img');
        tempCard.src = something['imageUrl'];
        extraDeckBuilder.append(tempCard);
    })
}

//render side deck 
const renderSideDeck = () => {
    sideDeckBuilder.innerHTML = '';
    sideDeck = sortDeck(sideDeck)
    sideDeck.forEach(something => {
        numCards++;
        if (something.owned === true) {
            numCardsOwned++;
        }
        let tempCard = document.createElement('img');
        tempCard.addEventListener('contextmenu', (e) => {
            numCards--;
            if (something.owned === true) {
                numCardsOwned--;
            }
            e.preventDefault()
            sideDeck.splice(sideDeck.indexOf(something), 1)
            tempCard.remove()
        })
        tempCard.addEventListener('click', async () => {
            displayCard.deck = 'sideDeck';
            displayCard.obj = something;
            cardViewImg.src = tempCard.src
            if (something.type === "Spell Card" || something.type === "Trap Card") {
                cardStats.textContent = ''
            } else if (something.type === "Link Monster") {
                cardStats.textContent = `ATK/${something.atk}`
            } else {
                cardStats.textContent = `ATK/${something.atk} DEF/${something.def}`
            }
            cardViewName.textContent = something.name
            cardViewAttributes.textContent = `[${something.race}/${something.type.split(' ')[0]}]`
            cardEffects.textContent = something.desc
            let prices = await getPrices(something.cardId);
            cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
            tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
            ebayPrice.textContent = `Ebay:$${prices[2]}`;
            if (something.owned === true) {
                ownedBtn.style.backgroundColor = '#007500';
                ownedBtn.textContent = 'Owned';
            }
            else {
                ownedBtn.style.backgroundColor = '#ff0000';
                ownedBtn.textContent = 'Not Owned';
            }
        })
        tempCard.classList.add('builder-img');
        tempCard.src = something['imageUrl'];
        sideDeckBuilder.append(tempCard);
    })
}
//render deck application portion
const renderDeck = () => {
    numCards = 0;
    numCardsOwned = 0;
    renderMainDeck();
    renderExtraDeck();
    renderSideDeck();
}

//sort deck according to requirements
const sortDeck = (unsortedDeck) => {
    let linkMonArray = [];
    let xyzMonArray = [];
    let synchroMonArray = [];
    let fusionMonArray = [];
    let monArray = [];
    let spellArray = [];
    let trapArray = [];

    //fill arrays by card type
    unsortedDeck.forEach(card => {
        if (card.type === "Link Monster") {
            linkMonArray.push(card);
        } else if (card.type === "XYZ Monster") {
            xyzMonArray.push(card);
        } else if (card.type === "Synchro Monster") {
            synchroMonArray.push(card);
        } else if (card.type === "Fusion Monster") {
            fusionMonArray.push(card);
        } else if (card.type.includes("Monster")) {
            monArray.push(card);
        } else if (card.type === "Spell Card") {
            spellArray.push(card);
        } else if (card.type === "Trap Card") {
            trapArray.push(card)
        }
    })

    //alpa comparator
    const compareCard = (a, b) => {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        } else {
            return 0;
        }
    }

    //sort each array by alpha
    linkMonArray.sort(compareCard);
    xyzMonArray.sort(compareCard);
    synchroMonArray.sort(compareCard);
    fusionMonArray.sort(compareCard);
    monArray.sort(compareCard);
    spellArray.sort(compareCard);
    trapArray.sort(compareCard);
    //return combined array
    return [...linkMonArray, ...xyzMonArray, ...synchroMonArray, ...fusionMonArray, ...monArray, ...spellArray, ...trapArray];
}

sortBtn.addEventListener('click', () => {
    renderDeck()
})

const testCardView = async (cardNameOrId) => {
    //undefined var
    let cardSearched;
    //check to see if it is a number or not
    if (isNaN(cardNameOrId)) {
        //not a number -> fetch by Name
        cardSearched = await fetchByName(cardNameOrId);
    } else {
        //is a number -> fetch by ID
        cardSearched = await fetchById(cardNameOrId);
    }

    cardViewImg.src = `https://ygoprodeck.com/pics/${cardSearched['id']}.jpg`;
    cardViewName.textContent = cardSearched['name'];
    cardViewAttributes.textContent = `${cardSearched['race']}/${cardSearched['type']}`;
    cardStats.textContent = `ATK/${cardSearched['atk']}`
    cardEffects.textContent = cardSearched['desc']
}

deckForm.addEventListener('change', () => {
    currDeck = deckForm[0].value;
    populateDecks(() => { });
})

ownedBtn.addEventListener('click', () => {
    if (ownedBtn.textContent === 'Not Owned') {
        ownedBtn.style.backgroundColor = '#007500';
        ownedBtn.textContent = 'Owned';
        numCardsOwned++;
    }
    else {
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
        numCardsOwned--;
    }
    switch (displayCard.deck) {
        case "mainDeck": {
            const ind = mainDeck.indexOf(displayCard.obj);
            mainDeck[ind].owned = !mainDeck[ind].owned;
            break;
        }
        case "extraDeck": {
            const ind = extraDeck.indexOf(displayCard.obj);
            extraDeck[ind].owned = !extraDeck[ind].owned;
            break;
        }
        case "sideDeck": {
            const ind = sideDeck.indexOf(displayCard.obj);
            sideDeck[ind].owned = !sideDeck[ind].owned;
            break;
        }
        default: {
            if (ownedBtn.textContent === 'Not Owned') {
                ownedBtn.style.backgroundColor = '#007500';
                ownedBtn.textContent = 'Owned';
                numCardsOwned++;
            }
            else {
                ownedBtn.style.backgroundColor = '#ff0000';
                ownedBtn.textContent = 'Not Owned';
                numCardsOwned--;
            }
        }
    }
})

const updateDeckSelector = async () => {
    const options = await fetchListDecks();
    deckForm.innerHTML = `
        <form id="deck-form">
            <label for= "decks" > Choose a Deck:</label >
            <select id="decks" name="deck-selector">

            </select>
        </form> 
        `
    options.forEach(option => {
        const op = document.createElement('option')
        op.value = option
        op.textContent = option
        deckForm[0].append(op)
    })
}

const resultCard = []


const resultCard0 = document.querySelector('#result-card-0');
const resultCard0img = document.querySelector("#result-card-0 > div.result-img-container > img");
const resultCard0title = document.querySelector("#result-card-0 > div.result-text-container > p.search-card-title");
const resultCard0details = document.querySelector("#result-card-0 > div.result-text-container > p.search-card-details");
const resultCard0stats = document.querySelector("#result-card-0 > div.result-text-container > p.search-card-stat");

const resultCard1 = document.querySelector('#result-card-1');
const resultCard1img = document.querySelector("#result-card-1 > div.result-img-container > img");
const resultCard1title = document.querySelector("#result-card-1 > div.result-text-container > p.search-card-title");
const resultCard1details = document.querySelector("#result-card-1 > div.result-text-container > p.search-card-details");
const resultCard1stats = document.querySelector("#result-card-1 > div.result-text-container > p.search-card-stat");

const resultCard2 = document.querySelector('#result-card-2');
const resultCard2img = document.querySelector("#result-card-2 > div.result-img-container > img");
const resultCard2title = document.querySelector("#result-card-2 > div.result-text-container > p.search-card-title");
const resultCard2details = document.querySelector("#result-card-2 > div.result-text-container > p.search-card-details");
const resultCard2stats = document.querySelector("#result-card-2 > div.result-text-container > p.search-card-stat");

const resultCard3 = document.querySelector('#result-card-3');
const resultCard3img = document.querySelector("#result-card-3 > div.result-img-container > img");
const resultCard3title = document.querySelector("#result-card-3 > div.result-text-container > p.search-card-title");
const resultCard3details = document.querySelector("#result-card-3 > div.result-text-container > p.search-card-details");
const resultCard3stats = document.querySelector("#result-card-3 > div.result-text-container > p.search-card-stat");

const resultCard4 = document.querySelector('#result-card-4');
const resultCard4img = document.querySelector("#result-card-4 > div.result-img-container > img");
const resultCard4title = document.querySelector("#result-card-4 > div.result-text-container > p.search-card-title");
const resultCard4details = document.querySelector("#result-card-4 > div.result-text-container > p.search-card-details");
const resultCard4stats = document.querySelector("#result-card-4 > div.result-text-container > p.search-card-stat");

const resultCard5 = document.querySelector('#result-card-5');
const resultCard5img = document.querySelector("#result-card-5 > div.result-img-container > img");
const resultCard5title = document.querySelector("#result-card-5 > div.result-text-container > p.search-card-title");
const resultCard5details = document.querySelector("#result-card-5 > div.result-text-container > p.search-card-details");
const resultCard5stats = document.querySelector("#result-card-5 > div.result-text-container > p.search-card-stat");

const resultCard6 = document.querySelector('#result-card-6');
const resultCard6img = document.querySelector("#result-card-6 > div.result-img-container > img");
const resultCard6title = document.querySelector("#result-card-6 > div.result-text-container > p.search-card-title");
const resultCard6details = document.querySelector("#result-card-6 > div.result-text-container > p.search-card-details");
const resultCard6stats = document.querySelector("#result-card-6 > div.result-text-container > p.search-card-stat");

const resultCard7 = document.querySelector('#result-card-7');
const resultCard7img = document.querySelector("#result-card-7 > div.result-img-container > img");
const resultCard7title = document.querySelector("#result-card-7 > div.result-text-container > p.search-card-title");
const resultCard7details = document.querySelector("#result-card-7 > div.result-text-container > p.search-card-details");
const resultCard7stats = document.querySelector("#result-card-7 > div.result-text-container > p.search-card-stat");

resultCard0img.addEventListener('click', async () => {
    displayCard = {deckName: 'none', obj: resultCard[0]}
    cardViewImg.src = resultCard[0].card_images[0].image_url
    if (resultCard[0].type === "Spell Card" || resultCard[0].type === "Trap Card") {
        cardStats.textContent = ''
    } else if (resultCard[0].type === "Link Monster") {
        cardStats.textContent = `ATK/${resultCard[0].atk}`
    } else {
        cardStats.textContent = `ATK/${resultCard[0].atk} DEF/${resultCard[0].def}`
    }
    cardViewName.textContent = resultCard[0].name
    cardViewAttributes.textContent = `[${resultCard[0].race}/${resultCard[0].type.split(' ')[0]}]`
    cardEffects.textContent = resultCard[0].desc
    let prices = await getPrices(resultCard[0].id);
    cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
    tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
    ebayPrice.textContent = `Ebay:$${prices[2]}`;
})
resultCard1img.addEventListener('click', async () => {
    displayCard = { deckName: 'none', obj: resultCard[1] }
    cardViewImg.src = resultCard[1].card_images[0].image_url
    if (resultCard[1].type === "Spell Card" || something.type === "Trap Card") {
        cardStats.textContent = ''
    } else if (resultCard[1].type === "Link Monster") {
        cardStats.textContent = `ATK/${resultCard[1].atk}`
    } else {
        cardStats.textContent = `ATK/${resultCard[1].atk} DEF/${resultCard[1].def}`
    }
    cardViewName.textContent = resultCard[1].name
    cardViewAttributes.textContent = `[${resultCard[1].race}/${resultCard[1].type.split(' ')[0]}]`
    cardEffects.textContent = resultCard[1].desc
    let prices = await getPrices(resultCard[1].id);
    cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
    tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
    ebayPrice.textContent = `Ebay:$${prices[2]}`;
})
resultCard2img.addEventListener('click', async () => {
    displayCard = { deckName: 'none', obj: resultCard[2] }
    cardViewImg.src = resultCard[2].card_images[0].image_url
    if (resultCard[2].type === "Spell Card" || resultCard[2].type === "Trap Card") {
        cardStats.textContent = ''
    } else if (resultCard[2].type === "Link Monster") {
        cardStats.textContent = `ATK/${resultCard[2].atk}`
    } else {
        cardStats.textContent = `ATK/${resultCard[2].atk} DEF/${resultCard[2].def}`
    }
    cardViewName.textContent = resultCard[2].name
    cardViewAttributes.textContent = `[${resultCard[2].race}/${resultCard[2].type.split(' ')[0]}]`
    cardEffects.textContent = resultCard[2].desc
    let prices = await getPrices(resultCard[2].id);
    cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
    tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
    ebayPrice.textContent = `Ebay:$${prices[2]}`;
})
resultCard3img.addEventListener('click', async () => {
    displayCard = { deckName: 'none', obj: resultCard[3] }
    cardViewImg.src = resultCard[3].card_images[0].image_url
    if (resultCard[3].type === "Spell Card" || resultCard[3].type === "Trap Card") {
        cardStats.textContent = ''
    } else if (resultCard[3].type === "Link Monster") {
        cardStats.textContent = `ATK/${resultCard[3].atk}`
    } else {
        cardStats.textContent = `ATK/${resultCard[3].atk} DEF/${resultCard[3].def}`
    }
    cardViewName.textContent = resultCard[3].name
    cardViewAttributes.textContent = `[${resultCard[3].race}/${resultCard[3].type.split(' ')[0]}]`
    cardEffects.textContent = resultCard[3].desc
    let prices = await getPrices(resultCard[3].id);
    cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
    tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
    ebayPrice.textContent = `Ebay:$${prices[2]}`;
})
resultCard4img.addEventListener('click', async () => {
    displayCard = { deckName: 'none', obj: resultCard[4] }
    cardViewImg.src = resultCard[4].card_images[0].image_url
    if (resultCard[4].type === "Spell Card" || resultCard[4].type === "Trap Card") {
        cardStats.textContent = ''
    } else if (resultCard[4].type === "Link Monster") {
        cardStats.textContent = `ATK/${resultCard[4].atk}`
    } else {
        cardStats.textContent = `ATK/${resultCard[4].atk} DEF/${resultCard[4].def}`
    }
    cardViewName.textContent = resultCard[4].name
    cardViewAttributes.textContent = `[${resultCard[4].race}/${resultCard[4].type.split(' ')[0]}]`
    cardEffects.textContent = resultCard[4].desc
    let prices = await getPrices(resultCard[4].id);
    cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
    tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
    ebayPrice.textContent = `Ebay:$${prices[2]}`;
})
resultCard5img.addEventListener('click', async () => {
    displayCard = { deckName: 'none', obj: resultCard[5] }
    cardViewImg.src = resultCard[5].card_images[0].image_url
    if (resultCard[5].type === "Spell Card" || resultCard[5].type === "Trap Card") {
        cardStats.textContent = ''
    } else if (resultCard[5].type === "Link Monster") {
        cardStats.textContent = `ATK/${resultCard[5].atk}`
    } else {
        cardStats.textContent = `ATK/${resultCard[5].atk} DEF/${resultCard[5].def}`
    }
    cardViewName.textContent = resultCard[5].name
    cardViewAttributes.textContent = `[${resultCard[5].race}/${resultCard[5].type.split(' ')[0]}]`
    cardEffects.textContent = resultCard[5].desc
    let prices = await getPrices(resultCard[5].id);
    cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
    tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
    ebayPrice.textContent = `Ebay:$${prices[2]}`;
})
resultCard6img.addEventListener('click', async () => {
    displayCard = { deckName: 'none', obj: resultCard[6] }
    cardViewImg.src = resultCard[6].card_images[0].image_url
    if (resultCard[6].type === "Spell Card" || resultCard[6].type === "Trap Card") {
        cardStats.textContent = ''
    } else if (resultCard[6].type === "Link Monster") {
        cardStats.textContent = `ATK/${resultCard[6].atk}`
    } else {
        cardStats.textContent = `ATK/${resultCard[6].atk} DEF/${resultCard[6].def}`
    }
    cardViewName.textContent = resultCard[2].name
    cardViewAttributes.textContent = `[${resultCard[6].race}/${resultCard[6].type.split(' ')[0]}]`
    cardEffects.textContent = resultCard[6].desc
    let prices = await getPrices(resultCard[6].id);
    cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
    tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
    ebayPrice.textContent = `Ebay:$${prices[2]}`;
})
resultCard7img.addEventListener('click', async () => {
    displayCard = { deckName: 'none', obj: resultCard[7] }
    cardViewImg.src = resultCard[7].card_images[0].image_url
    if (resultCard[7].type === "Spell Card" || resultCard[7].type === "Trap Card") {
        cardStats.textContent = ''
    } else if (resultCard[7].type === "Link Monster") {
        cardStats.textContent = `ATK/${resultCard[7].atk}`
    } else {
        cardStats.textContent = `ATK/${resultCard[7].atk} DEF/${resultCard[7].def}`
    }
    cardViewName.textContent = resultCard[7].name
    cardViewAttributes.textContent = `[${resultCard[7].race}/${resultCard[7].type.split(' ')[0]}]`
    cardEffects.textContent = resultCard[7].desc
    let prices = await getPrices(resultCard[7].id);
    cardMarketPrice.textContent = `Cardmarket: $${prices[0]}`;
    tcgPlayerPrice.textContent = `TCG Player: $${prices[1]}`;
    ebayPrice.textContent = `Ebay:$${prices[2]}`;
})


const setResults = (results, lowBound, upBound) => {
    let currResults = results.slice(lowBound, upBound);
    //console.log(results);
    resultCard[0] = currResults[0]
    resultCard0img.src = currResults[0].card_images[0].image_url;
    resultCard0title.textContent = currResults[0].name;
    resultCard0details.textContent = `★${currResults[0].level} [${currResults[0].race}] ${currResults[0].attribute}`;
    resultCard0stats.textContent = `ATK/${currResults[0].atk} DEF/${currResults[0].def}`;

    resultCard[1] = currResults[1]
    resultCard1img.src = currResults[1].card_images[0].image_url;
    resultCard1title.textContent = currResults[1].name;
    resultCard1details.textContent = `★${currResults[1].level} [${currResults[1].race}] ${currResults[1].attribute}`;
    resultCard1stats.textContent = `ATK/${currResults[1].atk} DEF/${currResults[1].def}`;


    resultCard[2] = currResults[2]
    resultCard2img.src = currResults[2].card_images[0].image_url;
    resultCard2title.textContent = currResults[2].name;
    resultCard2details.textContent = `★${currResults[2].level} [${currResults[2].race}] ${currResults[2].attribute}`;
    resultCard2stats.textContent = `ATK/${currResults[2].atk} DEF/${currResults[2].def}`;

    resultCard[3] = currResults[3]
    resultCard3img.src = currResults[3].card_images[0].image_url;
    resultCard3title.textContent = currResults[3].name;
    resultCard3details.textContent = `★${currResults[3].level} [${currResults[3].race}] ${currResults[3].attribute}`;
    resultCard3stats.textContent = `ATK/${currResults[3].atk} DEF/${currResults[3].def}`;

    resultCard[4] = currResults[4]
    resultCard4img.src = currResults[4].card_images[0].image_url;
    resultCard4title.textContent = currResults[4].name;
    resultCard4details.textContent = `★${currResults[4].level} [${currResults[4].race}] ${currResults[4].attribute}`;
    resultCard4stats.textContent = `ATK/${currResults[4].atk} DEF/${currResults[4].def}`;

    resultCard[5] = currResults[5]
    resultCard5img.src = currResults[5].card_images[0].image_url;
    resultCard5title.textContent = currResults[5].name;
    resultCard5details.textContent = `★${currResults[5].level} [${currResults[5].race}] ${currResults[5].attribute}`;
    resultCard5stats.textContent = `ATK/${currResults[5].atk} DEF/${currResults[5].def}`;

    resultCard[6] = currResults[6]
    resultCard6img.src = currResults[6].card_images[0].image_url;
    resultCard6title.textContent = currResults[6].name;
    resultCard6details.textContent = `★${currResults[6].level} [${currResults[6].race}] ${currResults[6].attribute}`;
    resultCard6stats.textContent = `ATK/${currResults[6].atk} DEF/${currResults[6].def}`;

    resultCard[7] = currResults[7]
    resultCard7img.src = currResults[7].card_images[0].image_url;
    resultCard7title.textContent = currResults[7].name;
    resultCard7details.textContent = `★${currResults[7].level} [${currResults[7].race}] ${currResults[7].attribute}`;
    resultCard7stats.textContent = `ATK/${currResults[7].atk} DEF/${currResults[7].def}`;
}

const clearResults = () => {
    resultCard0img.src = "";
    resultCard0title.textContent = "";
    resultCard0details.textContent = "";
    resultCard0stats.textContent = "";

    resultCard1img.src = "";
    resultCard1title.textContent = "";
    resultCard1details.textContent = "";
    resultCard1stats.textContent = "";
    resultCard2img.src = "";
    resultCard2title.textContent = "";
    resultCard2details.textContent = "";
    resultCard2stats.textContent = "";

    resultCard3img.src = "";
    resultCard3title.textContent = "";
    resultCard3details.textContent = "";
    resultCard3stats.textContent = "";

    resultCard4img.src = "";
    resultCard4title.textContent = "";
    resultCard4details.textContent = "";
    resultCard4stats.textContent = "";

    resultCard5img.src = "";
    resultCard5title.textContent = "";
    resultCard5details.textContent = "";
    resultCard5stats.textContent = "";

    resultCard6img.src = "";
    resultCard6title.textContent = "";
    resultCard6details.textContent = "";
    resultCard6stats.textContent = "";

    resultCard7img.src = "";
    resultCard7title.textContent = "";
    resultCard7details.textContent = "";
    resultCard7stats.textContent = "";
}

searchBar.addEventListener('submit', async (event) => {
    event.preventDefault();
    results = []; //empty array
    clearResults();
    const searchParam = searchBar['card-name'].value;
    if (searchParam != '') {
        results = await fetchSearch(searchParam.toLowerCase());
        totalPages = Math.ceil(results.length / 8);
        currPage = 1;
        let lowBound = 8 * (currPage - 1);
        let upBound = (8 * currPage);
        setResults(results, lowBound, upBound);
    }
    else {
        return alert('Invalid input!');
    }
})

prevBtn.addEventListener('click', async (event) => {
    if (currPage > 1) {
        currPage--;
        let lowBound = 8 * (currPage - 1);
        let upBound = (8 * currPage);
        setResults(results, lowBound, upBound);
    }
    else {
        alert('You are the first page of results!')
    }
})

nextBtn.addEventListener('click', async (event) => {
    if (currPage < totalPages) {
        currPage++;
        let lowBound = 8 * (currPage - 1);
        let upBound = (8 * currPage);
        setResults(results, lowBound, upBound);
    }
    else {
        alert('You are the last page of results!')
    }
})

resultCard0.addEventListener('click', async(event) => {
    if(resultCard0img.src != ''){
        cardViewImg.src = resultCard0img.src;
        cardViewName.textContent = resultCard0title.textContent;
        const selectedCard = await fetchByName(resultCard0title.textContent);
        cardViewAttributes.textContent = `[${selectedCard.race}/${selectedCard.type.split(' ')[0]}]`;
        cardEffects.textContent = selectedCard.desc;
        let prices = await getPrices(selectedCard.id);
        cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
        tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
        ebayPrice.textContent= `Ebay:$${prices[2]}`;
        if (selectedCard.type === "Spell Card" || selectedCard.type === "Trap Card") {
            cardStats.textContent = ''
        } else if (selectedCard.type === "Link Monster") {
            cardStats.textContent = `ATK/${selectedCard.atk}`
        } else {
            cardStats.textContent = `ATK/${selectedCard.atk} DEF/${selectedCard.def}`
        }
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
    }
})

resultCard1.addEventListener('click', async(event) => {
    if(resultCard1img.src != ''){
        cardViewImg.src = resultCard1img.src;
        cardViewName.textContent = resultCard1title.textContent;
        const selectedCard = await fetchByName(resultCard1title.textContent);
        cardViewAttributes.textContent = `[${selectedCard.race}/${selectedCard.type.split(' ')[0]}]`;
        cardEffects.textContent = selectedCard.desc;
        let prices = await getPrices(selectedCard.id);
        cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
        tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
        ebayPrice.textContent= `Ebay:$${prices[2]}`;
        if (selectedCard.type === "Spell Card" || selectedCard.type === "Trap Card") {
            cardStats.textContent = ''
        } else if (selectedCard.type === "Link Monster") {
            cardStats.textContent = `ATK/${selectedCard.atk}`
        } else {
            cardStats.textContent = `ATK/${selectedCard.atk} DEF/${selectedCard.def}`
        }
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
    }
})

resultCard2.addEventListener('click', async(event) => {
    if(resultCard2img.src != ''){
        cardViewImg.src = resultCard2img.src;
        cardViewName.textContent = resultCard2title.textContent;
        const selectedCard = await fetchByName(resultCard2title.textContent);
        cardViewAttributes.textContent = `[${selectedCard.race}/${selectedCard.type.split(' ')[0]}]`;
        cardEffects.textContent = selectedCard.desc;
        let prices = await getPrices(selectedCard.id);
        cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
        tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
        ebayPrice.textContent= `Ebay:$${prices[2]}`;
        if (selectedCard.type === "Spell Card" || selectedCard.type === "Trap Card") {
            cardStats.textContent = ''
        } else if (selectedCard.type === "Link Monster") {
            cardStats.textContent = `ATK/${selectedCard.atk}`
        } else {
            cardStats.textContent = `ATK/${selectedCard.atk} DEF/${selectedCard.def}`
        }
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
    }
})

resultCard3.addEventListener('click', async(event) => {
    if(resultCard3img.src != ''){
        cardViewImg.src = resultCard3img.src;
        cardViewName.textContent = resultCard3title.textContent;
        const selectedCard = await fetchByName(resultCard3title.textContent);
        cardViewAttributes.textContent = `[${selectedCard.race}/${selectedCard.type.split(' ')[0]}]`;
        cardEffects.textContent = selectedCard.desc;
        let prices = await getPrices(selectedCard.id);
        cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
        tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
        ebayPrice.textContent= `Ebay:$${prices[2]}`;
        if (selectedCard.type === "Spell Card" || selectedCard.type === "Trap Card") {
            cardStats.textContent = ''
        } else if (selectedCard.type === "Link Monster") {
            cardStats.textContent = `ATK/${selectedCard.atk}`
        } else {
            cardStats.textContent = `ATK/${selectedCard.atk} DEF/${selectedCard.def}`
        }
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
    }
})

resultCard4.addEventListener('click', async(event) => {
    if(resultCard4img.src != ''){
        cardViewImg.src = resultCard4img.src;
        cardViewName.textContent = resultCard4title.textContent;
        const selectedCard = await fetchByName(resultCard4title.textContent);
        cardViewAttributes.textContent = `[${selectedCard.race}/${selectedCard.type.split(' ')[0]}]`;
        cardEffects.textContent = selectedCard.desc;
        let prices = await getPrices(selectedCard.id);
        cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
        tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
        ebayPrice.textContent= `Ebay:$${prices[2]}`;
        if (selectedCard.type === "Spell Card" || selectedCard.type === "Trap Card") {
            cardStats.textContent = ''
        } else if (selectedCard.type === "Link Monster") {
            cardStats.textContent = `ATK/${selectedCard.atk}`
        } else {
            cardStats.textContent = `ATK/${selectedCard.atk} DEF/${selectedCard.def}`
        }
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
    }
})

resultCard5.addEventListener('click', async(event) => {
    if(resultCard5img.src != ''){
        cardViewImg.src = resultCard5img.src;
        cardViewName.textContent = resultCard5title.textContent;
        const selectedCard = await fetchByName(resultCard5title.textContent);
        cardViewAttributes.textContent = `[${selectedCard.race}/${selectedCard.type.split(' ')[0]}]`;
        cardEffects.textContent = selectedCard.desc;
        let prices = await getPrices(selectedCard.id);
        cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
        tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
        ebayPrice.textContent= `Ebay:$${prices[2]}`;
        if (selectedCard.type === "Spell Card" || selectedCard.type === "Trap Card") {
            cardStats.textContent = ''
        } else if (selectedCard.type === "Link Monster") {
            cardStats.textContent = `ATK/${selectedCard.atk}`
        } else {
            cardStats.textContent = `ATK/${selectedCard.atk} DEF/${selectedCard.def}`
        }
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
    }
})

resultCard6.addEventListener('click', async(event) => {
    if(resultCard6img.src != ''){
        cardViewImg.src = resultCard6img.src;
        cardViewName.textContent = resultCard6title.textContent;
        const selectedCard = await fetchByName(resultCard6title.textContent);
        cardViewAttributes.textContent = `[${selectedCard.race}/${selectedCard.type.split(' ')[0]}]`;
        cardEffects.textContent = selectedCard.desc;
        let prices = await getPrices(selectedCard.id);
        cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
        tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
        ebayPrice.textContent= `Ebay:$${prices[2]}`;
        if (selectedCard.type === "Spell Card" || selectedCard.type === "Trap Card") {
            cardStats.textContent = ''
        } else if (selectedCard.type === "Link Monster") {
            cardStats.textContent = `ATK/${selectedCard.atk}`
        } else {
            cardStats.textContent = `ATK/${selectedCard.atk} DEF/${selectedCard.def}`
        }
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
    }
})

resultCard7.addEventListener('click', async(event) => {
    if(resultCard7img.src != ''){
        cardViewImg.src = resultCard7img.src;
        cardViewName.textContent = resultCard7title.textContent;
        const selectedCard = await fetchByName(resultCard7title.textContent);
        cardViewAttributes.textContent = `[${selectedCard.race}/${selectedCard.type.split(' ')[0]}]`;
        cardEffects.textContent = selectedCard.desc;
        let prices = await getPrices(selectedCard.id);
        cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
        tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
        ebayPrice.textContent= `Ebay:$${prices[2]}`;
        if (selectedCard.type === "Spell Card" || selectedCard.type === "Trap Card") {
            cardStats.textContent = ''
        } else if (selectedCard.type === "Link Monster") {
            cardStats.textContent = `ATK/${selectedCard.atk}`
        } else {
            cardStats.textContent = `ATK/${selectedCard.atk} DEF/${selectedCard.def}`
        }
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
    }
})



cardViewImg.addEventListener('dragstart', (e) => {
    isDragging = true;
})

cardViewImg.addEventListener('dragend', () => {
    isDragging = false;
})

mainDeckBuilder.addEventListener('dragenter', (e) => {
    e.preventDefault()
})

mainDeckBuilder.addEventListener('dragover', (e) => {
    e.preventDefault()
})

mainDeckBuilder.addEventListener('drop', async () => {
    if (isDragging) {
        const details = await fetchByName(cardViewName.textContent)
        mainDeck.push({
            "cardId": details.id,
            "name": details.name,
            "type": details.type,
            "desc": details.desc,
            "atk": details.atk,
            "def": details.def,
            "level": details.level,
            "race": details.race,
            "attribute": details.attribute,
            "imageUrl": details.card_images[0].image_url,
            "owned": false
        })
        renderDeck()
    }
})

extraDeckBuilder.addEventListener('dragenter', (e) => {
    e.preventDefault()
})

extraDeckBuilder.addEventListener('dragover', (e) => {
    e.preventDefault()
})

extraDeckBuilder.addEventListener('drop', async () => {
    if (isDragging && extraDeck.length < 15) {
        const details = await fetchByName(cardViewName.textContent)
        extraDeck.push({
            "cardId": details.id,
            "name": details.name,
            "type": details.type,
            "desc": details.desc,
            "atk": details.atk,
            "def": details.def,
            "level": details.level,
            "race": details.race,
            "attribute": details.attribute,
            "imageUrl": details.card_images[0].image_url,
            "owned": false
        })
        renderDeck()
    }
})

sideDeckBuilder.addEventListener('dragenter', (e) => {
    e.preventDefault()
})

sideDeckBuilder.addEventListener('dragover', (e) => {
    e.preventDefault()
})

sideDeckBuilder.addEventListener('drop', async () => {
    if (isDragging && sideDeck.length < 15) {
        const details = await fetchByName(cardViewName.textContent)
        sideDeck.push({
            "cardId": details.id,
            "name": details.name,
            "type": details.type,
            "desc": details.desc,
            "atk": details.atk,
            "def": details.def,
            "level": details.level,
            "race": details.race,
            "attribute": details.attribute,
            "imageUrl": details.card_images[0].image_url,
            "owned": false
        })
        renderDeck()
    }
})

setInterval(() => {
    document.getElementById('card-count').textContent = `Number of Cards: ${numCards}`
    document.getElementById('owned-card-count').textContent = `Owned: ${numCardsOwned}`
}, 100);

saveBtn.addEventListener('click', () => {
    alert('deck saved')
    fetch(`${decksUrl}`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            deck: {
                mainDeck: mainDeck,
                extraDeck: extraDeck,
                sideDeck: sideDeck
            }
        })
    })
})

deleteBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to delete your deck?')) {
        mainDeck = [];
        extraDeck = [];
        sideDeck = [];
        
        fetch(`${decksUrl}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                deck: {
                    mainDeck: mainDeck,
                    extraDeck: extraDeck,
                    sideDeck: sideDeck
                }
            })
        }).then(
            renderDeck()
        )
    }
})


populateDecks(initalizeDeck);