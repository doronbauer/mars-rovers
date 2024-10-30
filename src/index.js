import fs from "fs";

let marsUpperRightPoint = { x: 0, y: 0 };
const marsLowerLeftPoint = { x: 0, y: 0 };
const roversPositions = [];

try {
  // Read file synchronously
  const data = fs.readFileSync("./src/input.txt", "utf-8");

  const lines = data.split(/\r?\n/);

  const upperRightPointFormat = /^\d+ \d+$/;

  // Check if the first line matches the expected format
  if (upperRightPointFormat.test(lines[0])) {
    marsUpperRightPoint.x = Number(lines[0].split(" ")[0]);
    marsUpperRightPoint.y = Number(lines[0].split(" ")[1]);
    console.log(
      `Upper right point is (${marsUpperRightPoint.x}, ${marsUpperRightPoint.y})`
    );
    lines.shift(); //removing the first line
  } else {
    console.error(
      "ERROR: The first input line is NOT in the expected format. Aborting ..."
    );
    process.exit(1);
  }

  const roverPositionFormat = /^\d+ \d+ [NSWE]$/;
  const roverMovementsFormat = /^[MLR]+$/;

  // Let's get started with the rovers
  for (let i = 0; i < lines.length; i += 2) {
    const roverPositionLine = lines[i];
    const roverMovementsLine = lines[i + 1];
    let roverPosition = {};
    if (!roverPositionLine || !roverMovementsLine) {
      console.log("Encountered empty line assuming end of input ...");
      process.exit(0);
    }
    console.log(`Rover ${i / 2 + 1}`);

    // Rover initial position
    if (roverPositionFormat.test(roverPositionLine)) {
      const [x, y, facing] = roverPositionLine.split(" ");
      roverPosition = {
        x: parseInt(x, 10),
        y: parseInt(y, 10),
        facing,
      };
      console.log(`Rover position is ${JSON.stringify(roverPosition)}`);
      if (!isPositionValid(roverPosition)) continue;
    } else {
      console.error(
        `ERROR: Rover coordinates line ${roverPositionLine} is NOT in the expected format. Aborting ...`
      );
      process.exit(1);
    }

    // Rover movements
    if (roverMovementsFormat.test(roverMovementsLine)) {
      console.log(`processing movements ${roverMovementsLine}`);

      for (const movement of roverMovementsLine) {
        const newPosition = moveRover(roverPosition, movement);
        //   console.log(JSON.stringify(roverPosition));
        if (isPositionValid(newPosition)) {
          roverPosition = newPosition;
        } else {
          break;
        }
      }
      console.log(`Rover final position is ${JSON.stringify(roverPosition)}`);
      roversPositions.push(roverPosition);
      //   console.log(JSON.stringify(roversPositions));
    } else {
      console.error(
        `ERROR: Rover movements line ${roverMovementsLine} is NOT in the expected format. Aborting ...`
      );
      process.exit(1);
    }
  }
} catch (error) {
  console.error("Error reading input file:", error);
}

function isUniquePosition(newPosition) {
  return !roversPositions.some(
    (position) => position.x === newPosition.x && position.y === newPosition.y
  );
}

function isPositionOnMars(newPosition) {
  return (
    newPosition.x >= marsLowerLeftPoint.x &&
    newPosition.x <= marsUpperRightPoint.x &&
    newPosition.y >= marsLowerLeftPoint.y &&
    newPosition.y <= marsUpperRightPoint.y
  );
}

function isPositionValid(newPosition) {
  let valid = true;
  if (!isPositionOnMars(newPosition)) {
    valid = false;
    console.error(
      `ERROR: Rover cannot move to position ${JSON.stringify(
        newPosition
      )} as it will fall from Mars plane!😵‍💫`
    );
  }
  if (!isUniquePosition(newPosition)) {
    valid = false;
    console.error(
      `ERROR: Collision ALERT, Rover cannot move to position ${JSON.stringify(
        newPosition
      )} because another rover is already there!🚕`
    );
  }
  return valid;
}

function moveRover(roverPosition, movement) {
  let newPosition = { ...roverPosition };
  if (movement === "M") {
    console.log("Move forward");
    if (roverPosition.facing === "N") {
      newPosition.y = roverPosition.y + 1;
    } else if (roverPosition.facing === "S") {
      newPosition.y = roverPosition.y - 1;
    } else if (roverPosition.facing === "W") {
      newPosition.x = roverPosition.x - 1;
    } else if (roverPosition.facing === "E") {
      newPosition.x = roverPosition.x + 1;
    }
  } else if (movement === "L") {
    console.log("Turn left");
    if (roverPosition.facing === "N") {
      newPosition.facing = "W";
    } else if (roverPosition.facing === "S") {
      newPosition.facing = "E";
    } else if (roverPosition.facing === "W") {
      newPosition.facing = "S";
    } else if (roverPosition.facing === "E") {
      newPosition.facing = "N";
    }
  } else if (movement === "R") {
    console.log("Turn right");
    if (roverPosition.facing === "N") {
      newPosition.facing = "E";
    } else if (roverPosition.facing === "S") {
      newPosition.facing = "W";
    } else if (roverPosition.facing === "W") {
      newPosition.facing = "N";
    } else if (roverPosition.facing === "E") {
      newPosition.facing = "S";
    }
  }
  return newPosition;
}

// Different approach to moveRover
// function moveRover(roverPosition, movement) {
//     const newPosition = { ...roverPosition };

//     const moveForward = {
//       N: { x: 0, y: 1 },
//       S: { x: 0, y: -1 },
//       E: { x: 1, y: 0 },
//       W: { x: -1, y: 0 }
//     };

//     const turnLeft = { N: "W", W: "S", S: "E", E: "N" };
//     const turnRight = { N: "E", E: "S", S: "W", W: "N" };

//     if (movement === "M") {
//       console.log("Move forward");
//       newPosition.x += moveForward[roverPosition.facing].x;
//       newPosition.y += moveForward[roverPosition.facing].y;
//     } else if (movement === "L") {
//       console.log("Turn left");
//       newPosition.facing = turnLeft[roverPosition.facing];
//     } else if (movement === "R") {
//       console.log("Turn right");
//       newPosition.facing = turnRight[roverPosition.facing];
//     }

//     return newPosition;
//   }

// Different approach to isPositionValid using exceptions. Can save checking if position is valid in case the rover is just turing left and right as the validation will be placed inside moveRover
// function isPositionValid(newPosition) {
//   if (!isPositionOnMars(newPosition)) {
//     throw new Error(
//       `Rover cannot move to position ${JSON.stringify(
//         newPosition
//       )} as it will fall from Mars plane!😵‍💫`
//     ); //
//   }
//   if (!isUniquePosition(newPosition)) {
//     throw new Error(
//       `Collision ALERT: Rover cannot move to position ${JSON.stringify(
//         newPosition
//       )} because another rover is already there!🚕`
//     ); //
//   }
// }
