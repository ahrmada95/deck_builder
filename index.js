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
    constructor(cardId, name, type, desc, atk, def, level, race, attribute, imageUrl) {
        this.cardId = cardId; this.name = name; this.type = type; this.desc = desc; this.atk = atk; this.def = def; this.level = level; this.race = race; this.attribute = attribute; this.imageUrl = imageUrl;
    }
}

//global variables
let currDeck = ''; //name of current deck
let mainDeck = []; //empty array to hold main deck
let extraDeck = []; //empty array to hold extra deck
let sideDeck = []; //empty array to hold side deck
let listDecks = []; //empty array to hold the list of deck names from db, will use to fill form options

//get urls for Yu-Gi-Oh! Prodeck API
const apiBaseUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?';
const urlCardName = `${apiBaseUrl}name=`;
const urlCardId = `${apiBaseUrl}id=`;
const baseUrlImg = 'https://ygoprodeck.com/pics/';
const deckUrl = `http://localhost:3000/${currDeck}`;

//grab elements
const cardViewImg = document.querySelector('#selected-card-img');
const cardViewName = document.querySelector('#select-card-name');
const cardViewAttributes = document.querySelector('#select-card-attributes');
const cardStats = document.querySelector('#select-card-stats');
const cardEffects = document.querySelector('#select-card-effects');

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

//DB CALL: fetch list of deck na`mes
const fetchListDecks = async () => {
    let req = await fetch('http://localhost:3000/decks');
    let res = await req.json();
    return Object.keys(res);
}

//DB CALLL: fetch deck information 
const fetchDeck = async (deckName) => {
    let req = await fetch(`http://localhost:3000/decks/`);
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
    console.log(deckList);
}

//render main deck
const renderMainDeck = () => {
    console.log(currDeck);
}

//render extra deck
const renderExtraDeck = () => {

}

//render side deck 
const renderSideDeck = () => {

}
//render deck application portion
const renderDeck = async (deckName) => {
    await 
    renderMainDeck();
    renderExtraDeck();
    renderSideDeck();
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

testCardView(80896940);
populateDecks(initalizeDeck);

// const newCardId = 99999999; 
// const newName = 'Test Monster'; //card name
// const newType = 'Monster'; //type of card
// const newDesc = 'Testing constructor.'; //description of card or card effect
// const newAtk = 2000; //attack point statline, NOTE that spells, traps do not have this stat
// const newDef = 2000; //defense point statline, NOTE that spells, traps, links, do not have stat
// const newLevel = 4; // card level (when applicable), NOTE that spells, traps, links, and XYZ do not have levels
// const newRace = 'Warrior'; //race of card, for spell/trap this describes the type of spell/trap they are 
// const newAttribute = 'Dark'; //attribute, does not apply to spell/trap
// const newImageUrl = 'google.com';// image url to g

// const newCard = new Card(newCardId, newName, newType, newDesc, newAtk, newDef, newLevel, newRace, newAttribute, newImageUrl);

// console.log(newCard);

// const cardViewer = document.querySelector('#card-viewer-img');
// const cardViewerName = document.querySelector("#card-viewer > h1");
// const cardViewerProperties = document.querySelector("#card-viewer > p.properties-text");
// const cardViewerEffects = document.querySelector("#card-viewer > p.effect-text");
// const cardViewerAtk = document.querySelector("#card-viewer > span > p:nth-child(1)");
// const cardViewerDef = document.querySelector("#card-viewer > span > p:nth-child(2)");


// const testCardView = async (cardNameorId) => {
//     let cardTitle = document.createElement('h1');
//     let cardImg = document.createElement('img');
//     let cardDesc = document.createElement('p');
//     cardDesc.classList.add('effect-text');
//     //undefined var
//     let cardSearched; 
//     //check to see if it is a number or not
//     if(isNaN(cardNameorId)){
//         //not a number -> fetch by Name
//         cardSearched = await fetchByName(cardNameorId);
//     } else {
//         //is a number -> fetch by ID
//         cardSearched = await fetchByName(cardNameorId);
//     }

//     cardTitle.textContent = cardSearched['name'];
//     //cardImg.src = 'https://storage.googleapis.com/ygoprodeck.com/pics/86066372.jpg'
//     cardImg.src = `https://ygoprodeck.com/pics/${cardSearched['id']}.jpg`;
    
// // const cardViewerProperties = document.querySelector("#card-viewer > p.properties-text");
// // const CardViewerEffects = document.querySelector("#card-viewer > p.effect-text");
// // const CardViewerAtk = document.querySelector("#card-viewer > span > p:nth-child(1)");
// // const CardViewerDef = document.querySelector("#card-viewer > span > p:nth-child(2)");
// }

// // const deckCount = 40;
// // const exDeckCount = 15;

// let mainDeck = document.getElementById('main-deck');
// let extraDeck = document.getElementById('extra-deck');
// let sideDeck = document.getElementById('side-deck');

// // for (let a=0; a < deckCount; a++){
// //     let tempImg = document.createElement('img');
// //     tempImg.src='./assets/img/EHeroStratos.png';
// //     tempImg.id= 'deck-builder-img';
// //     mainDeck.append(tempImg);
// //     tempImg.addEventListener('click', () => {
// //         cardViewer.src = tempImg.src;
// //     })
// // }
// // for (let b=0; b < exDeckCount; b++){
// //     let tempImg = document.createElement('img');
// //     tempImg.src='./assets/img/EHeroAbsZero.png';
// //     tempImg.id= 'extra-deck-img';
// //     extraDeck.append(tempImg);
// //     tempImg.addEventListener('click', () => {
// //         cardViewer.src = tempImg.src;
// //     })    
// // }
// // for (let c=0; c < exDeckCount; c++){
// //     let tempImg = document.createElement('img');
// //     tempImg.src='./assets/img/RivalryOfWarlords.jpg';
// //     tempImg.id= 'extra-deck-img';
// //     sideDeck.append(tempImg);
// //     tempImg.addEventListener('click', () => {
// //         cardViewer.src = tempImg.src;
// //     })
// // }

// const getDeckSource = async (url) => {
//     let req = await fetch(url);
//     let res = await req.json();
//     return res;
// }

// const populateDeck = async (inputDeck) => {
//     const deckSource = await inputDeck;

//     let mainSize = 0;
//     let extraSize = 0;
//     let sideSize = 0;

//     if (deckSource.sideDeck != null) {
//         sideSize = deckSource.sideDeck.length;
//         if (sideSize > 0) cardViewer.src = deckSource.sideDeck[0].imageUrl;
//     }
//     if (deckSource.extraDeck != null) {
//         extraSize = deckSource.extraDeck.length;
//         if (extraSize > 0) cardViewer.src = deckSource.extraDeck[0].imageUrl
//     }
//     if (deckSource.mainDeck != null) {
//         mainSize = deckSource.mainDeck.length;
//         if (mainSize > 0) cardViewer.src = deckSource.mainDeck[0].imageUrl
//     }

//     for (let a = 0; a < mainSize; a++) {
//         let tempImg = document.createElement('img');
//         tempImg.src = deckSource.mainDeck[a].imageUrl;
//         tempImg.classList.add('deck-builder-img');
//         mainDeck.append(tempImg);
//         let click_shit = tempImg.addEventListener('click', () => {
//             cardViewer.src = tempImg.src;
//             cardViewerName.textContent = deckSource.mainDeck[a]['name'];
//             cardViewerProperties.textContent = `${deckSource.mainDeck[a]['race']}/${deckSource.mainDeck[a]['type']}`;
//             cardViewerEffects.textContent = `${deckSource.mainDeck[a]['desc']}`;
//             if(deckSource.mainDeck[a]['type'] != "Spell Card" && deckSource.mainDeck[a]['type'] != "Trap Card") {
//                 cardViewerAtk.textContent = `ATK/${deckSource.mainDeck[a]['atk']}`;
//                 if(deckSource.mainDeck[a]['type']!='Link Monster') {
//                     cardViewerDef.textContent = `DEF/${deckSource.mainDeck[a]['def']}`;
//                 }
//             }
//         })
//         tempImg.addEventListener('contextmenu', event => {
//             event.preventDefault();
//             tempImg.remove();
//             tempImg.removeEventListener(click_shit);
//         })
//     }
//     for (let b = 0; b < extraSize; b++) {
//         let tempImg = document.createElement('img');
//         tempImg.src = deckSource.extraDeck[b].imageUrl;
//         tempImg.classList.add('extra-deck-img')
//         extraDeck.append(tempImg);
//         tempImg.addEventListener('click', () => {
//             cardViewer.src = tempImg.src;
//         })
//     }
//     for (let c = 0; c < sideSize; c++) {
//         let tempImg = document.createElement('img');
//         tempImg.src = deckSource.sideDeck[c].imageUrl;
//         tempImg.classList.add('extra-deck-img')
//         sideDeck.append(tempImg);
//         tempImg.addEventListener('click', () => {
//             cardViewer.src = tempImg.src;
//         })
//     }
// }


// const clearDecks = () => {
//     mainDeck.innerHTML = ''
//     extraDeck.innerHTML = ''
//     sideDeck.innerHTML = ''
// }

// const deckForm = document.getElementById("deck-form")

// populateDeck(getDeckSource(deckForm.decks.value))


// deckForm.addEventListener('change', () => {
//     clearDecks()
//     populateDeck(getDeckSource(deckForm.decks.value))
// })