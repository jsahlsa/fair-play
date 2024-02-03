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
    name.textContent = data[i].name;
    timesPlayed.textContent = data[i].timesPlayed;
    tr.setAttribute('class', `roster-item ${i}`);
    tr.appendChild(name);
    tr.appendChild(timesPlayed);
    parent.appendChild(tr);
  }
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

export function getRandomLineup(roster, count) {
  const lineup = getLineup();
  const length = roster.length;
  const numbersPlayed = [];
  while (lineup.length < count) {
    const random = Math.floor(Math.random() * length);
    if (numbersPlayed.includes(random)) {
      continue;
    } else {
      lineup.push(roster[random].name);
      numbersPlayed.push(random);
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
      };
    }
  }
  return roster;
}

export function setLineup(roster, count) {
  let lineup = [];
  // add everyone who didn't play last time
  for (let i = 0; i < roster.length; i++) {
    if (!roster[i].lastPlayed) {
      lineup.push(roster[i].name);
    }
  }
  // sort array by times played
  const rosterSorted = roster.sort((a, b) => {
    return a.timesPlayed - b.timesPlayed;
  });
  let i = 0;
  // add those who have played the least first
  while (lineup.length < count) {
    if (!lineup.includes(rosterSorted[i].name)) {
      lineup.push(rosterSorted[i].name);
    }
    i++;
  }
  console.log(roster, lineup);
  return lineup;
}
