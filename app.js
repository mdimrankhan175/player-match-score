const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertPlayerDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

const convertScoreDbObjectToResponseObject = (dbObject) => {
  return {
    playerMatchId: dbObject.player_match_id,
    playerId: dbObject.player_id,
    matchId: dbObject.match_id,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  };
};

// api - 1

app.get("/players/", async (req, res) => {
  const getPlayerQuery = `
    select * from player_details `;
  const playerArray = await database.all(getPlayerQuery);
  res.send(
    playerArray.map((eachPlayer) =>
      convertPlayerDbObjectToResponseObject(eachPlayer)
    )
  );
});

// api - 2

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery1 = `
    select * from player_details where player_id=${playerId};`;
  const player = await database.get(getPlayerQuery1);
  res.send(convertPlayerDbObjectToResponseObject(player));
});

// api - 3

app.put("/players/:playerId/", async (req, res) => {
  const { playerName } = req.body;
  const { playerId } = req.params;
  const updatePlayerQuery = `
    UPDATE player_details SET player_name='${playerName}' 
    WHERE player_id='${playerId}';`;

  await database.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

module.exports = app;
