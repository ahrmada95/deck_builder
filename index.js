//get urls for Yu-Gi-Oh! Prodeck API
const baseUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?';
const urlCardName = `${baseUrl}name=`;
const urlCardId = `${baseUrl}id=`;

const sampleLink = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?name=Accesscode%20Talker';

//fetch request to search by card's name
const fetchByName = async (cardName) => {
    //request from api
    let req = await fetch(`${urlCardName}${cardName}`);
    //get response back as json
    let res = await req.json();
    //return response, JUST THE CARD INFORMATION
    return res['data']['0'];
}

//fetch request to search by card's ID
const fetchByID = async (cardId) => {
    //request from api
    let req = await fetch(`${urlCardId}${cardId}`);
    //get response back as json
    let res = await req.json();
    //return response, JUST THE CARD INFORMATION
    return res['data']['0'];
}


const testCardView = async (cardNameorId) => {
    let cardTitle = document.createElement('h1');
    let cardImg = document.createElement('img');
    let cardDesc = document.createElement('p');
    //undefined var
    let cardSearched; 
    //check to see if it is a number or not
    if(isNaN(cardNameorId)){
        //not a number -> fetch by Name
        cardSearched = await fetchByName(cardNameorId);
    } else {
        //is a number -> fetch by ID
        cardSearched = await fetchByName(cardNameorId);
    }

    cardTitle.textContent = cardSearched['name'];
    //cardImg.src = 'https://storage.googleapis.com/ygoprodeck.com/pics/86066372.jpg'
    cardImg.src = cardSearched['card_images']['0']['image_url'];
    cardDesc = cardSearched['desc'];
    document.body.append(cardTitle, cardImg, cardDesc);
}
const print = async () => {
    let x = await fetchByName('Accesscode Talker');
    console.log(x);
}

testCardView('Number 39: Utopia');
