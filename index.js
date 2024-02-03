var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require('path');
const port = process.env.PORT || 3000;

const mysql = require('mysql');

app.get('/', function(req, res){
    const filePath = path.join(__dirname, 'test.html');
    res.sendFile(filePath);
});

let max = 10;
let min = 1;
let xc = 0;

io.on('connection', function(socket){
    console.log('A user connected');
    const generateRandomNumber = () => {

    const randomNumber = Math.random() * max;

    const roundedRandomNumber = randomNumber + min;

    const finalRandomNumber = roundedRandomNumber.toFixed(2);

    return finalRandomNumber;
    };

    const startProgram = () => {

        setTimeout(function(){
            socket.emit('working', '1');
        }, 1000);
        setTimeout(function(){
            socket.emit('prepareplane', '6');
        }, 1000);
        setTimeout(function(){
            socket.emit('flyplane', '7');
        }, 1000);
    
        var x = 1.00;
        setTimeout(function(){
			
			if(xc == 1){
				const connectionz = mysql.createConnection({
				host: process.env.host,
				user: process.env.user,
				password: process.env.password,
				database: process.env.database
				});
				const maxcrashQuery = 'SELECT * FROM crashgamerecordtwo WHERE id = ?';
				connectionz.query(maxcrashQuery, [xc], function (error, maxcrashResults) {
					if (error) {
					  console.error('Error executing query:', error);
					  return;
					}
					max = maxcrashResults[0].crashpoint;
					//max = 0.09;
					console.log('Max is : '+max);
					
					const generateRandomNumbera = () => {

					const randomNumbera = Math.random() * max;

					const roundedRandomNumbera = randomNumbera + min;

					const finalRandomNumbera = roundedRandomNumbera.toFixed(2);

					return finalRandomNumbera;
					};
				  
					const randomNumbera = generateRandomNumbera();
					console.log('Random a is : '+randomNumbera);
					const myInterval = setInterval(function(){
						x = parseFloat((x + 0.01).toFixed(2));
						socket.emit('crash-update', x.toFixed(2));
						if (x >= randomNumbera) {
							clearInterval(myInterval);
							socket.emit('updatehistory', x);
							socket.emit('reset', x);
							setTimeout(function(){
								socket.emit('removecrash', x);
								/* if(xc == 0){
									max = 10;
								} */
								max = 10;
								xc = 0;
								setTimeout(startProgram, 5000);
							}, 3000);
						}
					}, 100);
					
					connectionz.end(); //Caused trouble after one bet
				  });				  					
			}
			else{
				const randomNumber = generateRandomNumber();
				console.log('Random is : '+randomNumber);
				const myInterval = setInterval(function(){
					x = parseFloat((x + 0.01).toFixed(2));
					socket.emit('crash-update', x.toFixed(2));
					if (x >= randomNumber) {
						clearInterval(myInterval);
						socket.emit('updatehistory', x);
						socket.emit('reset', x);
						setTimeout(function(){
							socket.emit('removecrash', x);														
							setTimeout(startProgram, 5000);
						}, 3000);
					}
				}, 100);
			}
            
        }, 2000);
    };
    
    startProgram();
   
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
   socket.on('newBet', function (s, t) {

        const connectiona = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
        });
              
      const checkbalanceQuery = 'SELECT * FROM users WHERE username = ?';
      
      connectiona.query(checkbalanceQuery, [s], function (error, userResults) {
        if (error) {
          console.error('Error executing query:', error);
          return;
        }
        
        if (userResults.length === 0) {
          console.error('User not found');
          return;
        }
        
        const balance = userResults[0].balance;
        const newbalance = (balance - t).toFixed(2);
        
        const updateQuery = 'UPDATE users SET balance = ? WHERE username = ?';
        connectiona.query(updateQuery, [newbalance, s], function (error, updateResults) {
          if (error) {
            console.error('Error updating data:', error);
            return;
          }
          console.log('User balance updated successfully');
          
          const insertQuery = 'INSERT INTO crashbetrecord (username, amount) VALUES (?, ?)';
          connectiona.query(insertQuery, [s, t], function (error, insertResults) {
            if (error) {
              console.error('Error inserting data:', error);
              return;
            }
            console.log('Data inserted into crashbetrecord successfully');
            
			xc = 1;
			
			const refcode = userResults[0].refcode;
			const refcode1 = userResults[0].refcode1;
			const refcode2 = userResults[0].refcode2;
			
            connectiona.end();
          });
        });
      });
    });
    socket.on('addWin', function (s, t, e) {

        const connectionb = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
        });
        
        const checkbalanceQueryz = 'SELECT * FROM users WHERE username = ?';
      
        connectionb.query(checkbalanceQueryz, [s], function (error, userResultsz) {
        if (error) {
          console.error('Error executing query:', error);
          return;
        }
        
        if (userResultsz.length === 0) {
          console.error('User not found');
          return;
        }
        
        const balancez = userResultsz[0].balance;
        const newbalancez = (balancez + t * e).toFixed(2);
        
            const updateQueryz = 'UPDATE users SET balance = ? WHERE username = ?';
            connectionb.query(updateQueryz, [newbalancez, s], function (error, updateResultsz) {
              if (error) {
                console.error('Error updating data:', error);
                return;
              }
              console.log('User balance updated successfully');
              
                var suc = 'success';
                const updatecrashQueryz = 'UPDATE crashbetrecord SET status = ?, winpoint = ? WHERE username = ? ORDER BY id DESC LIMIT 1';
                connectionb.query(updatecrashQueryz, [suc, e, s], function (error, updateResultsz) {
                  if (error) {
                    console.error('Error updating data:', error);
                    return;
                  }
                  console.log('Crash Bet Record updated successfully');
                    connectionb.end();
                });
            });
        });
    });

});

http.listen(port, function(){
   console.log('listening on '+port);
});
