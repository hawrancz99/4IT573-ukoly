const http = require("http");
const { exit } = require("process");
// get 'prompt-sync' package to simply ask for user input
const prompt = require("prompt-sync")({ sigint: true });

// start node server
http
  .createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("Hello World!");
  })
  .listen(8080);

// main function for the whole game
const number_guess_game = () => {
  // generate random whole number between 0-10
  const rand_number = Math.floor(Math.random() * 10)+1;
  // variable to determine if user guessed the number
  let number_guessed = false;
  // declare number of guess which will keep track of number of user guesses
  let num_of_attempts = 0;
  // keep asking user until correct number is guessed
  while (!number_guessed) {
    // get user guess
    let guess = prompt("Guess a number from 0 to 10: ");
    // convert the string input to a number
    guess = Number(guess);
    // add +1 to attempts
    num_of_attempts++;
    // compare user guess and guessed number
    if (guess > rand_number) {
      console.log("Too high, try again.");
    } else if (guess < rand_number) {
      console.log("Too low, try again.");
    } else if (guess  === rand_number) {
      number_guessed = true;
      console.log(`Congratulations, you guessed the number. The number was ${rand_number}! Number of attempts: ${num_of_attempts}.`);
      // ask if user wants to play again
      let play_again = prompt('Do you want to play again? (answer "yes" or "no")');
      if(play_again === "yes"){
        number_guess_game();
      }else{
        console.log('Thanks for playing, goodbye!');
        exit();
      }
    }
  }
};
number_guess_game();
