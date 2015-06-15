var cards, count = 0, userName = "Tom";
var url = 'http://localhost:5000/api/cards/';
var loading = false;



//Save the post card
function saveCard(cardId, author, content){
    $.ajax({
        url: url + cardId,
        type: 'PUT',
        contentType: "application/json",
        data: "{ \"author\":\"" + author +"\", \"content\": \"" + content +"\" }",
        dataType: 'json',
        success: function(result) {
        }
    });
}

//Delete the post card
function deleteCard(cardId){
    $.ajax({
        url: url + cardId,
        type: 'DELETE',
        success: function(result) {
        }
    });
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
//        saveCards();
    });

    div.children().hover(function () {
        closeImg.removeClass("hide");
    }, function () {
        closeImg.addClass("hide");
    });
}

//  adds a new postcard to the 'cards' list
function addNewCard(cardId, title, content) {
    // use a random colour class
    var className = "colour" + Math.ceil(Math.random() * 3);
    if (cardId === "") {
       cardId = generateUUID();
    }
    // add a new card to the end of the list
    cards.append("<li><div class='" + className + "'>" +
        "<input type='hidden' id='cardId' value='" + cardId + "'>" +
        "<textarea readonly class='card-title' placeholder='Owner' maxlength='10'/>" +
        "<textarea class='card-content' placeholder='Your content here'/>" +
        "<img  src='close.png'/>" +
        "</div></li>");

    // get the new card that's just been added and attach the click event handler to its close button
    var newCard = cards.find("li:last");
    newCard.find("img").click(function () {
        // remove the card and save
        deleteCard(newCard.find("input[type=hidden]").val());
        newCard.remove();
    });

    //Add the update handler
    newCard.find("textarea.card-content").blur(function(){
        saveCard(newCard.find("input[type=hidden]").val(),
            newCard.find("textarea.card-title").val(),
            newCard.find("textarea.card-content").val() );
    });

    // hook up event handlers to show/hide close button as appropriate
    //addCardEvent(newCard);

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

    if(!loading)
        saveCard(newCard.find("input[type=hidden]").val(),
            newCard.find("textarea.card-title").val(),
            newCard.find("textarea.card-content").val() );
}

// load the cards saved in the local storage
function loadCards() {
    $.ajax({
        type: 'GET',
        url: url,
        data: { get_param: 'value' },
        dataType: 'json',
        success: function (data) {
            loading = true;
             $.each(data.rows, function(index, element) {
                addNewCard(element.id, element.doc.author, element.doc.content);
                count++;
            });
            // add a card to the list if there aren't any
            if (count === 0) {
                $("#btnNew").click();
            }
            loading = false;
        }
    });

}

//generate unique id for postcard
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

$(document).ready(function () {
    // get references to the 'cards' list
    cards = $("#cards");

    // load cards from local storage if one's available
    loadCards();

    // clicking the 'New card' button adds a new card to the list
    $("#btnNew").click(function () {
        addNewCard("");
    });
});
