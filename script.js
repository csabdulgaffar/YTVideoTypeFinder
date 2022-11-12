//jshint esversion:6
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const https = require('https');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Allwords', { useNewUrlParser: true })

const keywordSchema = new mongoose.Schema({
  word: String
})

const Item = new mongoose.model("Item", keywordSchema);

const defaultItems = [];


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {


  res.sendFile(__dirname + "/typefinder.html");


})


app.post('/', (req, res) => {


  /*get form data*/
  let link = req.body.link;

  /*regex to extract video id*/
  var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = link.match(regExp);
  if (match && match[2].length == 11) {
    var final_link = match[2];
    var filter = 1;
  } else {
    res.send("enter correct input , do a  back")
  }

  if (filter == 1) {


    /*api get*/
    url = `https://www.googleapis.com/youtube/v3/videos?key=AIzaSyCOX16PRRHc9ppREA_kWf3PlTvu2oveSdM&part=snippet&id=${final_link}`

    https.get(url, response => {

      let data = "";

      response.on("data", chunk => {
        data += chunk;
      })

      response.on("end", () => {


        const result = JSON.parse(data);

        const title = result.items[0].snippet.title;


        const channelTitle = result.items[0].snippet.channelTitle;

        const thumbnail = result.items[0].snippet.thumbnails.maxres.url;

        const description = result.items[0].snippet.description;

        const tags = result.items[0].snippet.tags;

        let text = " ";
        let alltags = [];
        for (var i in tags) {
          alltags.push(tags[i]);
        }
        const tagsfinal = alltags.toString();
        let words = text.concat(" ", title, " ", description, " ", channelTitle, " ", "tags :", tagsfinal);

        const finaldata = '"' + words + '"';

        let wordstocheck = ["course", "learn", "how to", "tutorial", "what is" , "how is" , "when is", "chapter", "topic" ];

        let wordfound = wordstocheck.some(i => finaldata.includes(i));

        var resultwordfound;
        if (wordfound == true) {
          resultwordfound = "Educational";
        }
        else {
          resultwordfound = "Not Educational"
        }


      

        console.log(result); // Output = true
        // const item2 = new Item({
        //   word: finaldata
        // })

        // item2.save();


        res.write("<h1> The video is " + resultwordfound + " </h1>")
        res.write("<hr>")
        res.write("<h1> Video Details" + " </h1>")
        res.write("<hr>")


        res.write("<p>Title of the Video :  </p><p>" + title + "</p>")
        res.write("<hr>")

        res.write("<p>Channel Title :  </p><p>" + channelTitle + "</p>")
        res.write("<hr>")

        res.write("<p> Tags of the Video </p>")
        for (var i in tags) {
          res.write(tags[i] + ", ");
        }

        res.write("<br><br>")
        res.write("<hr>")


        res.write("<p>Thumbnail of the video <p> <br>")
        res.write("<img src=" + thumbnail + "> <br> ")
        res.write("<hr>")

        res.write("<p>Video Description :  </p><p>" + description + "</p> <br>")
        res.send();

      })

    })
  }




})



app.listen(port, () => {
  console.log(`running ${port}`)
})
