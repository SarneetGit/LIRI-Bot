require("dotenv").config();

const keys = require("./keys.js");
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);
const inquire = require('inquirer');
const axios = require('axios');
const moment = require('moment');
const arg = process.argv

const defaultSong = 'Higher Love'
const defaultMovie = 'Get Out'
const defaultConcert = 'Jonas Brothers'

var search = ''
var choice = ''

var questions = [{
    name: 'choice',
    message: 'Hi I\'m LIRI, what can I search for you?',
    type: 'list',
    choices: [
      { name: 'I want to search a Song', value: 'spotify-this-song' },
      { name: 'I want to search a Movie', value: 'movie-this' },
      { name: 'I want to search a Band/Concert', value: 'concert-this' },
      { name: 'Surprise me, I am indecisive', value: 'do-what-it-says' }
    ]
},
{
    name : 'search',
    message : 'So what would you like to search?',
    type : 'input'
}]

inquire.prompt(questions[0]).then(answer => {
    if (answer.choice === 'do-what-it-says') {
        getSongRandom()
    }
    else {
        inquire.prompt(questions[1]).then(answer => {
            search = answer.search
        })
    }
})


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
        console.log(`The artists for '${data.tracks.items[0].name}' are: ${nameList.join(', ')}`)
        console.log(`--------------------------------------------------------------------------------------------------------------`)
        console.log(`Click on the link below a quick sample listen! \n${data.tracks.items[0].preview_url}`)
        console.log(`--------------------------------------------------------------------------------------------------------------`)
        console.log(`Album: ${data.tracks.items[0].album.name}`)
        console.log(`--------------------------------------------------------------------------------------------------------------`)
    });
}


function bandsInTown(band) {
    axios.get(`https://rest.bandsintown.com/artists/${band}/events?app_id=codingbootcamp`).then(
        (response) => {
            const event = response.data[0]
            if (event != null) {
                console.log(`---------------------------------------------------------------------`)
                console.log(`${band} will be performing at the ${event.venue.name}.`)
                console.log(`---------------------------------------------------------------------`)
                console.log(moment(event.datetime).format("dddd, MMMM Do YYYY, h:mm:ss a"))
                console.log(`---------------------------------------------------------------------`)
                console.log(`${event.venue.city}, ${event.venue.region}`)
            } else {
                console.log(`Sorry but ${band} does not have any events coming up...`)
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
            console.log(`Title: ${event.Title}`)
            console.log(`---------------------------------------`)
            console.log(`Year: ${event.Year}`)
            console.log(`---------------------------------------`)
            console.log(`IMDB rated the movie: ${event.imdbRating}`);
            console.log(`---------------------------------------`)
            console.log(`Rotten Tomatoes rated the movie: ${rottenTomatoe}`);
            console.log(`---------------------------------------`)
            console.log(`Produced in ${event.Country}`)
            console.log(`---------------------------------------`)
            console.log(`Language: ${event.Language}`)
            console.log(`---------------------------------------`)
            console.log(`Actors: ${event.Actors}`)
            console.log(`---------------------------------------`)
            console.log(`${event.Plot}`)
        }
    )
}

// omdbSearch(defaultMovie)
// sportifySearch(defaultSong)
// bandsInTown(defaultConcert)

function getSongRandom() {
    var fs = require("fs");
    fs.readFile("random.txt", "utf8", (error, data) =>  {
      if (error) {
        return console.log(error);
      }
      dList = data.split(',')
      choice = dList[0]
      search = dList[1]
    });
}

function whatToExecute(choice) {
    switch (choice) {
      case "spotify-this-song":
        search = search.trim().length == 0 ? defaultSpotifySong : search;
        sportifySearch(search);
        break;
  
      case "concert-this":
        search = search.trim().length == 0 ? defaultBand : search;
        bandsInTown(search);
        break;
  
      case "movie-this":
        search = search.trim().length == 0 ? defaultMovie : search;
        omdbSearch(search);
        break;
  
      case "do-what-it-says":
        sportifySearch(search);
        break;
  
      default:
        console.log("Invalid command, try again");
        break;
    }
  }

// function log
// var fs = require("fs");
// var text = 'gang' + ',';
// fs.appendFile("notLogFile.txt", text, function(err) {

//   if (err) {
//     console.log(err);
//   }

//   else {
//     console.log("Content Added!");
//   }

// });