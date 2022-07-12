// //get urls for Yu-Gi-Oh! Prodeck API
// const baseUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?';
// const urlCardName = `${baseUrl}name=`;
// const urlCardId = `${baseUrl}id=`;
// const baseUrlImg = 'https://ygoprodeck.com/pics/'; 

// const cardViewer = document.querySelector('#card-viewer-img');
// const cardViewerName = document.querySelector("#card-viewer > h1");
// const cardViewerProperties = document.querySelector("#card-viewer > p.properties-text");
// const cardViewerEffects = document.querySelector("#card-viewer > p.effect-text");
// const cardViewerAtk = document.querySelector("#card-viewer > span > p:nth-child(1)");
// const cardViewerDef = document.querySelector("#card-viewer > span > p:nth-child(2)");



// //fetch request to search by card's name
// const fetchByName = async (cardName) => {
//     //request from api
//     let req = await fetch(`${urlCardName}${cardName}`);
//     //get response back as json
//     let res = await req.json();
//     //return response, JUST THE CARD INFORMATION
//     return res['data']['0'];
// }

// //fetch request to search by card's ID
// const fetchByID = async (cardId) => {
//     //request from api
//     let req = await fetch(`${urlCardId}${cardId}`);
//     //get response back as json
//     let res = await req.json();
//     //return response, JUST THE CARD INFORMATION
//     return res['data']['0'];
// }

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