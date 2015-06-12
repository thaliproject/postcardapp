var cards, count = 0, userName = "Tom";

// save the cards
function saveCards() {

    //TODO: Save the cards to PouchDB

    var cardsArray = [];

    // for each of the cards add a bespoke card object to the array
    cards.find("li > div").each(function (i, e) {
        // save the class attribute of the div, as well as the text for the title and content text areas
        var colourClass = $(e).attr("class");
        var title = $(e).find("textarea.card-title");
        var content = $(e).find("textarea.card-content");

        cardsArray.push({ Index: i, Title: title.val(), Content: content.val(), Class: colourClass });
    });

    // json encode it
    var jsonStr = JSON.stringify(cardsArray);

    // and save the json string into local storage
    localStorage.setItem("cards", jsonStr);
}

// add event handlers to a card
function addCardEvent(cardElement) {
    var div = cardElement.children("div");
    var closeImg = div.find("img");

    div.focus(function () {
        closeImg.removeClass("hide");
    });

    div.children().focus(function () {
        closeImg.removeClass("hide");
    });

    div.hover(function () {
        closeImg.removeClass("hide");
    }, function () {
        closeImg.addClass("hide");
        saveCards();
    });

    div.children().hover(function () {
        closeImg.removeClass("hide");
    }, function () {
        closeImg.addClass("hide");
    });
}

//  adds a new postcard to the 'cards' list
function addNewCard(className, title, content) {
    // if class is not specified, use a random colour class
    if (!className) {
        className = "colour" + Math.ceil(Math.random() * 3);
    }

    // add a new card to the end of the list
    cards.append("<li><div class='" + className + "'>" +
        "<textarea readonly class='card-title' placeholder='Owner' maxlength='10'/>" +
        "<textarea class='card-content' placeholder='Your content here'/>" +
        "<img class='hide' src='close.png'/>" +
        "</div></li>");

    // get the new card that's just been added and attach the click event handler to its close button
    var newCard = cards.find("li:last");
    newCard.find("img").click(function () {
        // remove the card and save
        newCard.remove();
        saveCards();
    });

    // hook up event handlers to show/hide close button as appropriate
    addCardEvent(newCard);

    // if a title is provided then set the title of the new card
    if (title)
        newCard.find("textarea.card-title").val(title);
    else
        newCard.find("textarea.card-title").val(userName);//Use the current userName

    // if a content is provided then set the content of the new card
    if (content) {
        // get the content textarea element and set its value
        newCard.find("textarea.card-content").val(content);
    }

    // save
    saveCards();
}

// load the cards saved in the local storage
function loadCards() {
    //TODO: Load cards from the thali db

    var storedCards = localStorage.getItem("cards");
    if (storedCards) {
        // passes the stored json back into an array of card objects
        var cardsArray = JSON.parse(storedCards);
        count = cardsArray.length;

        var i;
        for (i = 0; i < count; i++) {
            var storedCard = cardsArray[i];
            addNewCard(storedCard.Class, storedCard.Title, storedCard.Content);
        }
    }
}

$(document).ready(function () {
    // get references to the 'cards' list
    cards = $("#cards");

    // load cards from local storage if one's available
    loadCards();

    // clicking the 'New card' button adds a new card to the list
    $("#btnNew").click(function () {
        addNewCard();
    });

    // add a card to the list if there aren't any
    if (count === 0) {
        $("#btnNew").click();
    }
});
