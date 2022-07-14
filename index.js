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
let displayCard = {deckName: '', obj: ''};
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

const fetchSearch = async(cardName) => {
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
    console.log(currDeck);
    renderMainDeck();
    renderExtraDeck();
    renderSideDeck();

    const sortedDeck = sortDeck(mainDeck); 
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
    if(mainDeck.length > 40 && mainDeck.length <= 50) {
        mainDeckBuilder.classList.remove('deck-ct-40');
        mainDeckBuilder.classList.add('deck-ct-50');
    } else if (mainDeck.length > 40 && mainDeck.length <= 60){
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
        if(something.owned === true) {
            numCardsOwned++;
        }
        tempCard.addEventListener('contextmenu', (e) => {
            numCards--;
            if(something.owned === true) {
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
            cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
            tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
            ebayPrice.textContent= `Ebay:$${prices[2]}`;
            if(something.owned === true){
                ownedBtn.style.backgroundColor = '#007500';
                ownedBtn.textContent = 'Owned';
            }
            else{
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
    extraDeck.forEach(something => {
        numCards++;
        if(something.owned === true){
            numCardsOwned++;
        }
        let tempCard = document.createElement('img');
        tempCard.addEventListener('contextmenu',(e) => {   
            numCards--;
            if(something.owned === true) {
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
            } else  if (something.type === "Link Monster") {
                cardStats.textContent = `ATK/${something.atk}`
            } else {
                cardStats.textContent = `ATK/${something.atk} DEF/${something.def}`
            }
            cardViewName.textContent = something.name
            cardViewAttributes.textContent = `[${something.race}/${something.type.split(' ')[0]}]`
            cardEffects.textContent = something.desc
            let prices = await getPrices(something.cardId);
            cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
            tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
            ebayPrice.textContent= `Ebay:$${prices[2]}`;
            if(something.owned === true){
                ownedBtn.style.backgroundColor = '#007500';
                ownedBtn.textContent = 'Owned';
            }
            else{
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
    sideDeck.forEach(something => {
        numCards++;
        if(something.owned === true){
            numCardsOwned++;
        }
        let tempCard = document.createElement('img');
        tempCard.addEventListener('contextmenu', (e) => {
            numCards--;
            if(something.owned === true) {
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
            cardMarketPrice.textContent= `Cardmarket: $${prices[0]}`;
            tcgPlayerPrice.textContent= `TCG Player: $${prices[1]}`;
            ebayPrice.textContent= `Ebay:$${prices[2]}`;
            if(something.owned === true){
                ownedBtn.style.backgroundColor = '#007500';
                ownedBtn.textContent = 'Owned';
            }
            else{
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
    let xyzMonArray =[];
    let synchroMonArray = [];
    let fusionMonArray =[];
    let monArray = [];
    let spellArray = [];
    let trapArray = [];

    //fill arrays by card type
    unsortedDeck.forEach(card => {
        if(card.type === "Link Monster"){
            linkMonArray.push(card);
        } else if(card.type === "XYZ Monster"){
            xyzMonArray.push(card);
        } else if(card.type === "Synchro Monster"){
            synchroMonArray.push(card);
        } else if(card.type === "Fusion Monster"){
            fusionMonArray.push(card);
        } else if(card.type.includes("Monster")){
            monArray.push(card);
        } else if(card.type === "Spell Card") {
            spellArray.push(card);
        } else if(card.type === "Trap Card") {
            trapArray.push(card)
        }
    })

    //alpa comparator
    const compareCard = (a,b) => {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name){
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

const testCardView = async(cardNameOrId) => {
    //undefined var
    let cardSearched; 
    //check to see if it is a number or not
    if(isNaN(cardNameOrId)){
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
    populateDecks(() => {});
})

ownedBtn.addEventListener('click', () => {
    if(ownedBtn.textContent === 'Not Owned') {
        ownedBtn.style.backgroundColor = '#007500';
        ownedBtn.textContent = 'Owned';
        numCardsOwned++;
    }
    else {
        ownedBtn.style.backgroundColor = '#ff0000';
        ownedBtn.textContent = 'Not Owned';
        numCardsOwned--;
    }
    switch(displayCard.deck) {
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
        default: console.log("reached end of switch - something went wrong");
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

const resultCard0img = document.querySelector("#result-card-0 > div.result-img-container > img");
const resultCard0title = document.querySelector("#result-card-0 > div.result-text-container > p.search-card-title");
const resultCard0details = document.querySelector("#result-card-0 > div.result-text-container > p.search-card-details");
const resultCard0stats = document.querySelector("#result-card-0 > div.result-text-container > p.search-card-stat");

const resultCard1img = document.querySelector("#result-card-1 > div.result-img-container > img");
const resultCard1title = document.querySelector("#result-card-1 > div.result-text-container > p.search-card-title");
const resultCard1details = document.querySelector("#result-card-1 > div.result-text-container > p.search-card-details");
const resultCard1stats = document.querySelector("#result-card-1 > div.result-text-container > p.search-card-stat");

const resultCard2img = document.querySelector("#result-card-2 > div.result-img-container > img");
const resultCard2title = document.querySelector("#result-card-2 > div.result-text-container > p.search-card-title");
const resultCard2details = document.querySelector("#result-card-2 > div.result-text-container > p.search-card-details");
const resultCard2stats = document.querySelector("#result-card-2 > div.result-text-container > p.search-card-stat");

const resultCard3img = document.querySelector("#result-card-3 > div.result-img-container > img");
const resultCard3title = document.querySelector("#result-card-3 > div.result-text-container > p.search-card-title");
const resultCard3details = document.querySelector("#result-card-3 > div.result-text-container > p.search-card-details");
const resultCard3stats = document.querySelector("#result-card-3 > div.result-text-container > p.search-card-stat");

const resultCard4img = document.querySelector("#result-card-4 > div.result-img-container > img");
const resultCard4title = document.querySelector("#result-card-4 > div.result-text-container > p.search-card-title");
const resultCard4details = document.querySelector("#result-card-4 > div.result-text-container > p.search-card-details");
const resultCard4stats = document.querySelector("#result-card-4 > div.result-text-container > p.search-card-stat");

const resultCard5img = document.querySelector("#result-card-5 > div.result-img-container > img");
const resultCard5title = document.querySelector("#result-card-5 > div.result-text-container > p.search-card-title");
const resultCard5details = document.querySelector("#result-card-5 > div.result-text-container > p.search-card-details");
const resultCard5stats = document.querySelector("#result-card-5 > div.result-text-container > p.search-card-stat");

const resultCard6img = document.querySelector("#result-card-6 > div.result-img-container > img");
const resultCard6title = document.querySelector("#result-card-6 > div.result-text-container > p.search-card-title");
const resultCard6details = document.querySelector("#result-card-6 > div.result-text-container > p.search-card-details");
const resultCard6stats = document.querySelector("#result-card-6 > div.result-text-container > p.search-card-stat");

const resultCard7img = document.querySelector("#result-card-7 > div.result-img-container > img");
const resultCard7title = document.querySelector("#result-card-7 > div.result-text-container > p.search-card-title");
const resultCard7details = document.querySelector("#result-card-7 > div.result-text-container > p.search-card-details");
const resultCard7stats = document.querySelector("#result-card-7 > div.result-text-container > p.search-card-stat");

const setResults = (results, lowBound, upBound) => {
        let currResults = results.slice(lowBound,upBound);
        console.log(results);
        resultCard0img.src = currResults[0].card_images[0].image_url;
        resultCard0title.textContent = currResults[0].name;
        resultCard0details.textContent = `★${currResults[0].level} [${currResults[0].race}] ${currResults[0].attribute}`;
        resultCard0stats.textContent = `ATK/${currResults[0].atk} DEF/${currResults[0].def}`;

        resultCard1img.src = currResults[1].card_images[0].image_url;
        resultCard1title.textContent = currResults[1].name;
        resultCard1details.textContent = `★${currResults[1].level} [${currResults[1].race}] ${currResults[1].attribute}`;
        resultCard1stats.textContent = `ATK/${currResults[1].atk} DEF/${currResults[1].def}`;
        resultCard2img.src = currResults[2].card_images[0].image_url;
        resultCard2title.textContent = currResults[2].name;
        resultCard2details.textContent = `★${currResults[2].level} [${currResults[2].race}] ${currResults[2].attribute}`;
        resultCard2stats.textContent = `ATK/${currResults[2].atk} DEF/${currResults[2].def}`;

        resultCard3img.src = currResults[3].card_images[0].image_url;
        resultCard3title.textContent = currResults[3].name;
        resultCard3details.textContent = `★${currResults[3].level} [${currResults[3].race}] ${currResults[3].attribute}`;
        resultCard3stats.textContent = `ATK/${currResults[3].atk} DEF/${currResults[3].def}`;

        resultCard4img.src = currResults[4].card_images[0].image_url;
        resultCard4title.textContent = currResults[4].name;
        resultCard4details.textContent = `★${currResults[4].level} [${currResults[4].race}] ${currResults[4].attribute}`;
        resultCard4stats.textContent = `ATK/${currResults[4].atk} DEF/${currResults[4].def}`;

        resultCard5img.src = currResults[5].card_images[0].image_url;
        resultCard5title.textContent = currResults[5].name;
        resultCard5details.textContent = `★${currResults[5].level} [${currResults[5].race}] ${currResults[5].attribute}`;
        resultCard5stats.textContent = `ATK/${currResults[5].atk} DEF/${currResults[5].def}`;

        resultCard6img.src = currResults[6].card_images[0].image_url;
        resultCard6title.textContent = currResults[6].name;
        resultCard6details.textContent = `★${currResults[6].level} [${currResults[6].race}] ${currResults[6].attribute}`;
        resultCard6stats.textContent = `ATK/${currResults[6].atk} DEF/${currResults[6].def}`;

        resultCard7img.src = currResults[7].card_images[0].image_url;
        resultCard7title.textContent = currResults[7].name;
        resultCard7details.textContent = `★${currResults[7].level} [${currResults[7].race}] ${currResults[7].attribute}`;
        resultCard6stats.textContent = `ATK/${currResults[7].atk} DEF/${currResults[7].def}`;
}

searchBar.addEventListener('submit', async (event) => {
    event.preventDefault();
    results.length = 0; //empty array
    const searchParam = searchBar['card-name'].value;
    if (searchParam != ''){ 
        results = await fetchSearch(searchParam.toLowerCase());
        totalPages = Math.ceil(results.length/8);
        currPage = 1;
        let lowBound = 8*(currPage - 1);
        let upBound = (8*currPage); 
        setResults(results, lowBound, upBound);
    }
    else {
        return alert('Invalid input!');
    }
})

prevBtn.addEventListener('click', async(event) => {
    if(currPage > 1){
        currPage--;
        let lowBound = 8*(currPage - 1);
        let upBound = (8*currPage);
        setResults(results, lowBound, upBound);
    }
    else {
        alert('You are the first page of results!')
    }
})

nextBtn.addEventListener('click', async(event) => {
    if(currPage < totalPages){
        currPage++;
        let lowBound = 8*(currPage - 1);
        let upBound = (8*currPage);
        setResults(results, lowBound, upBound);
    }
    else {
        alert('You are the last page of results!')
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

mainDeckBuilder.addEventListener('drop', () => {
    if (isDragging) {
        mainDeck.push(mainDeck[0])
        renderDeck()
    }
})

extraDeckBuilder.addEventListener('dragenter', (e) => {
    e.preventDefault()
})

extraDeckBuilder.addEventListener('dragover', (e) => {
    e.preventDefault()
})

extraDeckBuilder.addEventListener('drop', () => {
    if (isDragging && extraDeck.length < 15) {
        extraDeck.push(extraDeck[0])
        renderDeck()
    }
})

sideDeckBuilder.addEventListener('dragenter', (e) => {
    e.preventDefault()
})

sideDeckBuilder.addEventListener('dragover', (e) => {
    e.preventDefault()
})

sideDeckBuilder.addEventListener('drop', () => {
    if (isDragging && sideDeck.length < 15) {
        sideDeck.push(sideDeck[0])
        renderDeck()
    }
})

setInterval(() => {
    document.getElementById('card-count').textContent = `Number of Cards: ${numCards}`
    document.getElementById('owned-card-count').textContent = `Owned: ${numCardsOwned}`
}, 100);


populateDecks(initalizeDeck);