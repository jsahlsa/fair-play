/**
 * Fair play app
 * features:
 * creates a lineup
 * generates a fair play substitution each time
 * uses local storage for roster and lineups
 */

import "./style.css";
import {
    getLineup,
    getRandomLineup,
    getRoster,
    paintRoster,
    paintLineup,
    resetLineup,
    saveRoster,
    setLineup,
    saveLineup,
} from "./helpers.js";

// get add player button
const addToRoster = document.querySelector(".add-to-roster");
const rosterList = document.querySelector(".roster-list");
const player = document.querySelector("#add-player");
const makeLineupBtn = document.querySelector(".make-lineup");
const clearDataBtn = document.querySelector(".clear-data");
const lineupContainer = document.querySelector(".lineup-container");
const rosterContainer = document.querySelector(".roster-container");
const rosterBtn = document.querySelector(".roster-btn");
const lineupBtn = document.querySelector(".lineup-btn");
const tableHeads = document.querySelector(".table-heads");

/**
 * Adds player to roster
 * First checks if roster and lineup exists
 * if one does, paints dom
 * if not, adds player to roster, then paints dom
 */

// globals

let firstLineup = true;
const count = 5;

// on load get and paint roster and lineup if they are in storage
window.onload = (e) => {
    player.focus();
    const roster = getRoster();
    const lineup = getLineup();
    if (roster.length > 0) {
        paintRoster(roster, rosterList);
        makeLineupBtn.style.visibility = "visible";
    }
    if (lineup.length > 0) {
        // do something if there are lineups
    } else {
        // do something if no lineups
    }
};

function rosterAdd(e) {
    // make lineup button visible if roster has more than 0
    // check for roster
    const roster = getRoster();
    const name = player.value;
    // make sure its something
    if (name.length === 0) {
        alert("Enter a value");
        return;
    }
    for (let i = 0; i < roster.length; i++) {
        if (name === roster[i].name) {
            alert("Name already exists");
            return;
        }
    }
    // push person to roster with data attributes that contain
    // name, whether they played last, how many times they played
    // and whether they are active
    roster.push({
        name: name,
        lastPlayed: false,
        timesPlayed: 0,
        active: true,
    });
    // reset input
    player.value = "";
    if (roster.length > 0) {
        makeLineupBtn.style.visibility = "visible";
    }
    player.focus();
    saveRoster(roster);
    paintRoster(roster, rosterList);
}

function makeLineup() {
    // get roster from local storage
    let roster = getRoster();
    let lineup = getLineup();
    // find number of active players
    const activePlayers = roster.filter((player) => player.active).length;
    console.log("active players: ", activePlayers);
    // if roster length is less than starting lineup length
    if (roster.length <= count) {
        // get all players names
        // do not include if they are not active
        lineup = roster
            .filter((player) => player.active)
            .map((player) => player.name);
        resetLineup(roster, lineup);
        firstLineup = false;
        // if this is the first lineup < roster length
    } else if (firstLineup) {
        lineup = getRandomLineup(roster, count, activePlayers);
        resetLineup(roster, lineup);
        firstLineup = false;
        // if 2nd or more lineup with roster length > starter length
    } else {
        lineup = setLineup(roster, count, activePlayers);
        resetLineup(roster, lineup);
    }
    // paint lineup to DON
    // save roster to local storage
    saveLineup(lineup);
    const allLineups = getLineup();
    paintLineup(allLineups, lineupContainer);
    saveRoster(roster);
    roster = getRoster();
    paintRoster(roster, rosterList);
    lineupBtnClick();
}

function clearData() {
    localStorage.clear();
    location.reload();
}

function rosterBtnClick() {
    rosterContainer.style.visibility = "visible";
    tableHeads.style.visibility = "visible";
    lineupContainer.style.display = "none";
    rosterBtn.classList.remove("inactive");
    lineupBtn.classList.add("inactive");
    const roster = getRoster();
    paintRoster(roster, rosterList);
}

function lineupBtnClick() {
    rosterContainer.style.visibility = "hidden";
    tableHeads.style.visibility = "hidden";
    lineupContainer.style.display = "block";
    rosterBtn.classList.add("inactive");
    lineupBtn.classList.remove("inactive");
    const lineup = getLineup();
    paintLineup(lineup, lineupContainer);
}

addToRoster.addEventListener("click", rosterAdd);
makeLineupBtn.addEventListener("click", makeLineup);
clearDataBtn.addEventListener("click", clearData);
rosterBtn.addEventListener("click", rosterBtnClick);
lineupBtn.addEventListener("click", lineupBtnClick);
