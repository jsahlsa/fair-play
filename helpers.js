// check for roster
// if exists set it, if not make empty array to hold it
export function getRoster() {
  const roster = JSON.parse(localStorage.getItem('roster'));
  if (roster !== null) {
    return roster;
  }
  return [];
}

// check for lineup in local storage
// if there grab it and sort it based on lineup number
// return either lineup array or empty array
export function getLineup() {
  const lineup = JSON.parse(localStorage.getItem('lineups'));
  if (lineup !== null) {
    return lineup.sort((a, b) => b.number - a.number);
  }
  return [];
}

// save roster to local storage
export function saveRoster(roster) {
  localStorage.setItem('roster', JSON.stringify(roster));
}

// save lineup
export function saveLineup(lineup) {
  const oldLineups = getLineup();

  let lineupNumber = 0;
  if (oldLineups.length > 0) {
    lineupNumber = oldLineups[0].number + 1;
  }
  oldLineups.push({ number: lineupNumber, lineup: lineup });
  localStorage.setItem('lineups', JSON.stringify(oldLineups));
}

// paint roster to the DOM
export function paintRoster(data, parent) {
  parent.innerHTML = '';
  for (let i = 0; i < data.length; i++) {
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    const timesPlayed = document.createElement('td');
    // create column to keep track of active/inactive players
    const active = document.createElement('td');
    const activeBtn = document.createElement('input');
    // assign data attribute to each active button
    activeBtn.setAttribute('data-name', data[i].name);
    // assign active class to button
    activeBtn.setAttribute('class', 'active');
    activeBtn.type = 'checkbox';
    // append active button to td
    active.appendChild(activeBtn);
    name.textContent = data[i].name;
    timesPlayed.textContent = data[i].timesPlayed;
    // make button checked if they are not active
    if (data[i].active === false) {
      activeBtn.setAttribute('checked', true);
    } else {
      activeBtn.removeAttribute('checked');
    }
    tr.setAttribute('class', `roster-item ${i}`);
    tr.appendChild(name);
    tr.appendChild(timesPlayed);
    // append active column
    tr.appendChild(active);
    parent.appendChild(tr);
    // use checkbox as parameter for inOut function
    inOut(activeBtn);
  }
}

// inOut function defines behavior for active checkboxes
// if checked player is out, if unchecked player is in
function inOut(btn) {
  function activeChanged() {
    // if player is acive
    // mark them as out in roster object
    const roster = getRoster();
    // get current lineup
    const lineup = getLineup();
    // get name of person being checked
    const name = this.getAttribute('data-name');

    // marking them as inactive:
    if (this.checked) {
      // showDialog function to check whether game is in progress or we are between periods
      // return value should be yes or no
      const playing = showDialog(name);
      console.log(playing);
      // find name in roster
      for (let i = 0; i < roster.length; i++) {
        if (roster[i].name === name) {
          roster[i].active = false;
        }
      }
      // if player is inactive
    } else {
      for (let i = 0; i < roster.length; i++) {
        if (roster[i].name === name) {
          roster[i].active = true;
          console.log(roster);
        }
      }
      console.log('unchecked');
    }
    saveRoster(roster);
  }
  btn.addEventListener('change', activeChanged);
}

// showDialog function returns yes or no
function showDialog(playerName) {
  let dialogHTML = `
  <form method="dialog">
    <p>Currently Playing?</p>
    <button class="yes">Yes</button>
    <button class="no">No</button>
  </form>
  `;
  const dialog = document.createElement('dialog');
  dialog.innerHTML = dialogHTML;
  const body = document.querySelector('body');
  body.appendChild(dialog);
  // selector for modal buttons
  const dialogButtons = dialog.querySelectorAll('button');

  // function that runs when dialog button is pressed
  function handleButton(e) {
    // get class name of button pressed
    const name = e.target.getAttribute('class');
    // get roster for both functions
    const roster = getRoster();
    // if yes we need to decrement by .5 times played
    // for player coming off, and increment by .5
    // times played for player coming on
    // player coming on should be lowest on times played
    // if more than one, then choose at random
    if (name === 'yes') {
      // sort roster by times played lowest to highest
      roster.sort((a, b) => a.timesPlayed - b.timesPlayed);
      // get lowest amount of times played
      const eligiblePlayers = [];
      // find all players in the roster who have played this amount of times
      for (let i = 0; i < roster.length; i++) {
        if (roster[i].active && !roster[i].lastPlayed) {
          eligiblePlayers.push(roster[i].name);
        }
      }
      console.log('eligible: ', eligiblePlayers);
      // initialize player to come on
      let playerToComeOn;
      const lineup = getLineup();
      const currentLineup = lineup[0].lineup;
      let playerIndex;
      // if player is in the lineup get their index
      if (currentLineup.includes(playerName)) {
        playerIndex = currentLineup.indexOf(playerName);
      }
      if (eligiblePlayers.length === 1) {
        playerToComeOn = eligiblePlayers[0];
      } else if (eligiblePlayers.length === 0) {
        currentLineup.splice(playerIndex, 1);
        // check if person made inactive is in the lineup
      } else {
        playerToComeOn = getOneAtRandom(eligiblePlayers);
      }
      // remove player made inactive and add new player
      // only if there are is a player to come on
      if (playerToComeOn) {
        currentLineup.splice(playerIndex, 1, playerToComeOn);
      }
      lineup[0].lineup = currentLineup;
      // increment times played by .5 for player coming on
      // change status to last played to true
      for (let i = 0; i < roster.length; i++) {
        if (roster[i].name === playerToComeOn) {
          roster[i].lastPlayed = true;
          roster[i].timesPlayed += 0.5;
        }
        // do the opposite for the player coming off
        if (roster[i].name === playerName) {
          roster[i].timesPlayed -= 0.5;
          roster[i].lastPlayed = false;
        }
      }
      const lineupContainer = document.querySelector('.lineup-container');
      const rosterContainer = document.querySelector('.roster-list');
      saveRoster(roster);
      saveLineup(currentLineup);
      paintRoster(roster, rosterContainer);
      paintLineup(lineup, lineupContainer);
    }
    console.log(roster, 'here');
  }

  // add an event listener for each dialog button
  dialogButtons.forEach((button) => {
    button.addEventListener('click', handleButton);
  });
  const lineup = getLineup();
  if (lineup.length > 0) {
    dialog.showModal();
  }
}

function getOneAtRandom(arr) {
  const number = Math.floor(Math.random() * arr.length);
  return arr[number];
}

// paint lineup to the DOM
export function paintLineup(data, parent) {
  parent.innerHTML = '';
  for (let i = 0; i < data.length; i++) {
    const lineup = data[i].lineup;
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = `Lineup ${data[i].number + 1}`;
    if (data[i].number === data.length - 1) {
      details.setAttribute('open', 'true');
    }
    const list = document.createElement('ol');
    for (let j = 0; j < lineup.length; j++) {
      const item = document.createElement('li');
      item.textContent = lineup[j];
      list.appendChild(item);
    }
    details.appendChild(summary);
    details.appendChild(list);
    parent.appendChild(details);
  }
}

export function getRandomLineup(roster, count, activePlayers) {
  const lineup = getLineup();
  const length = roster.length;
  const numbersPlayed = [];
  // add players to the lineup while it is below the count
  // or below the number of active players
  while (lineup.length < count && lineup.length < activePlayers) {
    const random = Math.floor(Math.random() * length);
    if (numbersPlayed.includes(random)) {
      continue;
    } else {
      if (roster[random].active) {
        lineup.push(roster[random].name);
        numbersPlayed.push(random);
      }
    }
  }
  return lineup;
}

// sets player in roster if playing
// increments times played, sets lastPlayed
export function setPlaying(player) {
  let getTimesPlayed = player.timesPlayed;
  player = {
    name: player.name,
    lastPlayed: true,
    timesPlayed: (getTimesPlayed += 1),
    active: player.active,
  };
  return player;
}

// updates roster object based on player playing or not
export function resetLineup(roster, lineup) {
  for (let i = 0; i < roster.length; i++) {
    if (lineup.includes(roster[i].name)) {
      roster[i] = setPlaying(roster[i]);
    } else {
      roster[i] = {
        name: roster[i].name,
        lastPlayed: false,
        timesPlayed: roster[i].timesPlayed,
        active: roster[i].active,
      };
    }
  }
  return roster;
}

export function setLineup(roster, count, activePlayers) {
  let lineup = [];
  // add everyone who didn't play last time
  // unless they are not active
  for (let i = 0; i < roster.length; i++) {
    if (!roster[i].lastPlayed && roster[i].active === true) {
      lineup.push(roster[i].name);
    }
  }
  // sort array by times played
  const rosterSorted = roster.sort((a, b) => {
    return a.timesPlayed - b.timesPlayed;
  });
  let i = 0;
  // add those who have played the least first
  // do not include if they are not active
  while (lineup.length < count && lineup.length < activePlayers) {
    if (!lineup.includes(rosterSorted[i].name) && rosterSorted[i].active) {
      lineup.push(rosterSorted[i].name);
    }
    i++;
  }
  // console.log(roster, lineup);
  return lineup;
}
