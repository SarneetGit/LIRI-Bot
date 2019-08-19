require("dotenv").config();

const keys = require("./keys.js");
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);
const inquire = require('inquirer');
const axios = require('axios');
const moment = require('moment');

// const arg = process.argv

//As I chose to add a validation to my input prompt, I do not use the defaults unless I need to unit test my functions
// const defaultSong = 'Higher Love'
// const defaultMovie = 'Get Out'
// const defaultConcert = 'Jonas Brothers'

// Global variables to hold the search and choice whenever input is received from user
var search = ''
var choice = ''

//Hold all questions to be used in inquire
var questions = [{
        name: 'choice',
        message: 'Hi I\'m LIRI, what can I search for you?',
        type: 'list',
        choices: [{
                name: 'I want to search a Song',
                value: 'spotify-this-song'
            },
            {
                name: 'I want to search a Movie',
                value: 'movie-this'
            },
            {
                name: 'I want to search a Band/Concert',
                value: 'concert-this'
            },
            {
                name: 'Surprise me, I am indecisive',
                value: 'do-what-it-says'
            }
        ]
    },
    {
        name: 'search',
        message: 'So what would you like to search?',
        type: 'input',
        validate: function (input) {
            if (input.length === 0) {
                return `Please enter a valid search.`
            }
            return true
        }
    }
]

function sportifySearch(song) {
    spotify.search({
        type: 'track',
        query: song
    }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        let nameList = []
        data.tracks.items[0].artists.forEach(artist => {
            nameList.push(artist.name)
        });
        console.log(`--------------------------------------------------------------------------------------------------------------`)
        log(`The artists for '${data.tracks.items[0].name}' are: ${nameList.join(', ')}`)
        console.log(`--------------------------------------------------------------------------------------------------------------`)
        log(`Click on the link below a quick sample listen! \n${data.tracks.items[0].preview_url}`)
        console.log(`--------------------------------------------------------------------------------------------------------------`)
        log(`Album: ${data.tracks.items[0].album.name}`)
        console.log(`--------------------------------------------------------------------------------------------------------------`)
    });
}

function bandsInTown(band) {
    axios.get(`https://rest.bandsintown.com/artists/${band}/events?app_id=codingbootcamp`).then(
        (response) => {
            const event = response.data[0]
            if (event != null) {
                console.log(`---------------------------------------------------------------------`)
                log(`${band} will be performing at the ${event.venue.name}.`)
                console.log(`---------------------------------------------------------------------`)
                log(moment(event.datetime).format("dddd, MMMM Do YYYY, h:mm:ss a"))
                console.log(`---------------------------------------------------------------------`)
                log(`${event.venue.city}, ${event.venue.region}`)
            } else {
                log(`Sorry but ${band} does not have any events coming up...`)
            }
        }
    ).catch((error) => {
        console.log(error)
    })
}

function omdbSearch(movie) {
    axios.get(`http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`).then(
        function (response) {
            const event = response.data
            let rottenTomatoe = ''
            for (let i of event.Ratings) {
                if (i.Source === 'Rotten Tomatoes')
                    rottenTomatoe = i.Value
            }
            if (rottenTomatoe === '') {
                rottenTomatoe = 'N/A'
            }
            console.log(`---------------------------------------`)
            log(`Title: ${event.Title}`)
            console.log(`---------------------------------------`)
            log(`Year: ${event.Year}`)
            console.log(`---------------------------------------`)
            log(`IMDB rated the movie: ${event.imdbRating}`);
            console.log(`---------------------------------------`)
            log(`Rotten Tomatoes rated the movie: ${rottenTomatoe}`);
            console.log(`---------------------------------------`)
            log(`Produced in ${event.Country}`)
            console.log(`---------------------------------------`)
            log(`Language: ${event.Language}`)
            console.log(`---------------------------------------`)
            log(`Actors: ${event.Actors}`)
            console.log(`---------------------------------------`)
            log(`${event.Plot}`)
        }
    )
}

function getSongRandom() {
    var fs = require("fs");
    fs.readFile("random.txt", "utf8", (error, data) => {
        if (error) {
            return console.log(error);
        }
        dList = data.split(',')
        choice = dList[0]
        search = dList[1]
        whatToExecute(choice)
    });
}

function whatToExecute(choice) {
    switch (choice) {
        case 'spotify-this-song':
            sportifySearch(search);
            break;

        case 'concert-this':
            bandsInTown(search);
            break;

        case 'movie-this':
            omdbSearch(search);
            break;

        case 'do-what-it-says':
            sportifySearch(search);
            break;

        default:
            log('Something went wrong...');
            break;
    }
}

function log(message) {
    console.log(message)
    var fs = require("fs");
    fs.appendFile("notLogFile.txt", message+'\n', function(err) {    
      if (err) {
        console.log(err);
      }
    });
}

// Begin program by asking for input
inquire.prompt(questions[0]).then(response => {
    //Set choice as selection from questions
    choice = response.choice
    //If user selects do-what-it-says, go alternate path
    if (response.choice === 'do-what-it-says') {
        getSongRandom()
    } 
    //Else go logical path
    else {
        inquire.prompt(questions[1]).then(response => {
            search = response.search.trim()
            whatToExecute(choice)
        })
    }
})

//Unit Testing each function
// omdbSearch(defaultMovie)
// sportifySearch(defaultSong)
// bandsInTown(defaultConcert)


