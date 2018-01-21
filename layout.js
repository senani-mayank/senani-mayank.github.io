var fileType;
var reader = new FileReader();
var mybinaryfile = "dfd";
var visionApiUrl = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0";
var visionApiKey = "64d312538167425eb6a158f22fe56ad8";
var emotionApiUrl = "https://westus.api.cognitive.microsoft.com/emotion/v1.0";
var emotionApiKey = "6b2b0ca1fb5c446e87ebff6a7abc9782";
var faceApiUrl = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0";
var faceApiKey = "0b5e228f166643bcb58d0a8a8db855e0";

function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

$(document).on('ready', function() {

    $('#PhotoPicker').on('change', function(e) {
        e.preventDefault();
        if (this.files.length === 0) return;
        var imageFile = this.files[0];
        populatebinaryfile(imageFile, 1 );
    });
    $('#ocr').on('change', function(e) {
        e.preventDefault();
        if (this.files.length === 0) return;
        var imageFile = this.files[0];
        populatebinaryfile(imageFile, 2);
    });
    $('#face').on('change', function(e) {
        e.preventDefault();
        if (this.files.length === 0) return;
        var imageFile = this.files[0];
        populatebinaryfile(imageFile, 3);
    });


});

function populatebinaryfile(imageData , type) {

    fileInputOnChange(imageData, type );

}




//onChange event handler for file input
function fileInputOnChange( imageFile, type ) {

    var reader = new FileReader();
    var fileType;

    //wire up the listener for the async 'loadend' event
    reader.addEventListener('loadend', function() {

        //get the result of the async readAsArrayBuffer call
        var fileContentArrayBuffer = reader.result;
	var query = "";
	var endpoint = "";
	var api = "";
	var key = "";
	/*if( type == 0 ){
		query = "?visualFeatures=Description,Tags";
		endpoint = "/analyze";
		api = visionApiUrl;
		key = visionApiKey;
	}*/
	if( type == 1 ){
		api = visionApiUrl;
		key = visionApiKey;
		query = "?maxCandidates=2";
		endpoint = "/describe";
		
        }
	else if( type == 2 ){
		query = "?language=en&detectOrientation=true";
		endpoint = "/ocr";
		api = visionApiUrl;
		key = visionApiKey;
        }
	else if( type == 3 ){
		query = "?returnFaceAttributes=age,gender,emotion,glasses,hair";
		api = faceApiUrl;
		key = faceApiKey;
		endpoint = "/detect";
		
        }

        //now that we've read the file, make the ajax call
        $.ajax({
                url: api + endpoint + query,
                beforeSend: function(xhrObj) {
                    // Request headers
                    xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", key);
                },
                type: "POST",

                //don't forget this!
                processData: false,

                //NOTE: the fileContentArrayBuffer is the single element 
                //IN AN ARRAY passed to the constructor!
                data: new Blob([fileContentArrayBuffer], {
                    type: fileType
                })
            })
            .done(function(data) {
                console.log(data)
		if( type == 1 ){
		        var text = returnDescription(data);
		        playSound(text);
		}
		else if( type == 2 ){
		        var text = returnOcr(data);
		        playSound(text);
		}
		else if( type == 3 ){
		        var text = returnFaceText(data);
		        playSound(text);
		}

               // $("#mytext").text(text);

            })
            .fail(function(err) {
                console.log(err)
            });

    });
    if (imageFile) {
        //save the mime type of the file
        fileType = imageFile.type;

        //read the file asynchronously
        reader.readAsArrayBuffer(imageFile);
    }
}



function returnDescription(data) {
	//$("#mytext").text(data.description.captions[0].text);
    return data.description.captions[0].text;
}

function returnOcr( data ){
	var text = "";
	var i = 1;
	var regions = data.regions;
	for( var region in regions ){
		var r = regions[region];
		console.log( "region:" + i, r );
		text = text + "\n Region " + (i++) ;
		var k = 1;
		var lines = r.lines;
		for( line in lines ){
			var l = lines[line];
			text = text + "\n Line " + (k++) + ".\n" ;
			var words = l.words;
			for( word in words ){
				text = text + words[word].text + " ";
			}
		}
	}
	
	if( regions.lenght == 0 ){
		text = "No Characters, Recognized in Given Image.";
	}	
	
	return text;
}

function returnFaceText( persons ){
	var len = persons.length;
	var text = len + " face " + ( (len > 1) ? "s" : "" ) + "detected.\n";
	var i = 1;
	for( p in persons ){
		text = text + "\nDescribing Person " + ( i++ ) + "\n";
		var person = persons[p];
		var attrs = person.faceAttributes;
		var age = attrs.age;
		var heshe = attrs.gender == "male" ? "He" : "SHE" ;
		var wearGlasses = ( attrs.glasses == "NoGlasses" ) ? "Does NOT" : "" ;
		var hair = attrs.hair;
		text = text + " " + heshe + " is " + attrs.gender + ".\n";
		text = text + "with age around " + age + "years.\n";
		text = text + " " + heshe + " " + wearGlasses  + " Wears Glasses.\n";
		if( hair.bald >= 0.8 ){
			text = text + " " + heshe + " is Bald.\n";
		}
		else{
			text = text + " " + heshe + " has probably " + hair.hairColor[0].color + " Coloured Hairs.\n";
		}
	}
	console.log( "tttt", text );
	//$("#mytext").text(text);
	return text;
}

function playSound(text) {
    responsiveVoice.speak(text);
}


/*
Endpoint: https://westus.api.cognitive.microsoft.com/emotion/v1.0

Key 1: 6b2b0ca1fb5c446e87ebff6a7abc9782

Key 2: af1566ef006e40cda3ad314182fa7851
*/

var artyom = new Artyom();

artyom.addCommands([
    {
        indexes: ['Hello','Hi','is someone there'],
        action: (i) => {
            artyom.say("Hi user, I am listening.");
        }
    },
    {
        indexes: ['snap','map','ek picture','take picture', 'around', "what around", 'a picture', 'picture'],
        action: (i) => {
            artyom.say("camera opened, please take picture for analysis.");
	    //document.getElementById('l1').click();
	    $("#PhotoPicker").trigger('touch');
        }
    },
    {
        indexes: ['ocr','see', 'oseer', 'perform ocr', 'perform'],
        action: (i) => {
            artyom.say("camera opened, Take Pictiure for ocr");
        }
    },
    {
        indexes: ['describe faces','describe', 'faces'],
        action: (i) => {
            artyom.say("camera opened, Take Pictiure for Faces Recognization");
        }
    },
]);


artyom.initialize({
    lang: "en-IN", // GreatBritain english
    continuous: true, // Listen forever
    soundex: true,// Use the soundex algorithm to increase accuracy
    debug: true, // Show messages in the console
    executionKeyword: "and do it now",
    listen: true // Start to listen commands !

    // If providen, you can only trigger a command if you say its name
    // e.g to trigger Good Morning, you need to say "Jarvis Good Morning"
    //,name: "Jarvis" 
}).then(() => {
    console.log("Artyom has been succesfully initialized");
}).catch((err) => {
    console.error("Artyom couldn't be initialized: ", err);
});

function lucky(){
	artyom.say("The 3rd Eye aims at Describing Surroundings, at the Abstract Level, to people with Accessibility Issues Using AI.");
}
