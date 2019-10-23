/**
 * Dependencies
 */

import axiosWithAuth from "./axiosWithAuth";
import { wait, moveWithWiseExplorer, pickItem } from "./util";
import { baseUrl } from "./constants";

/**
 * Constants
 */

const reverseDirection = {
  n: "s",
  s: "n",
  e: "w",
  w: "e"
};

/**
 * Define Helpers
 */

/**
 * Define traversal algorithm
 */

//  returns a promise that can be used to halt something for an allotted amount of time

async function traverseMap() {
  const traversalGraph = {};
  const stack = [];

  try {
    // Get current room information
    const response = await axiosWithAuth().get(`${baseUrl}/api/adv/init/`);

    let currentRoomID = response.data.room_id;
    traversalGraph[currentRoomID] = response.data;
    for (let i = 0; i < response.data.exits.length; i++) {
      traversalGraph[currentRoomID][response.data.exits[i]] = "?";
    }

    await wait(response.data.cooldown);

    let counter = 0;
    while (Object.keys(traversalGraph).length <= 500) {
      let prevRoomID = currentRoomID;
      let prevRoom = traversalGraph[prevRoomID];

      const unexploredExits = [];
      const exits = prevRoom.exits;
      for (let i = 0; i < exits.length; i++) {
        if (prevRoom[exits[i]] === "?") {
          unexploredExits.push(exits[i]);
        }
      }

      let direction;
      if (unexploredExits.length > 0) {
        direction = unexploredExits.pop();
        stack.push(reverseDirection[direction]);
      } else {
        direction = stack.pop();
      }

      await pickItem(prevRoom);

      const moveRes = await moveWithWiseExplorer(prevRoomID, direction);
      currentRoomID = moveRes.data.room_id;
      if (!(currentRoomID in traversalGraph)) {
        traversalGraph[currentRoomID] = moveRes.data;
        for (let i = 0; i < moveRes.data.exits.length; i++) {
          traversalGraph[currentRoomID][moveRes.data.exits[i]] = "?";
        }
      }
      traversalGraph[prevRoomID][direction] = currentRoomID;
      traversalGraph[currentRoomID][reverseDirection[direction]] = prevRoomID;

      console.log("traversalGraph", traversalGraph);
      localStorage.setItem("graph", JSON.stringify(traversalGraph));

      // waits to run next iteration of while loop until cooldown is ready
      await wait(moveRes.data.cooldown);
    }
    console.info("Loop finished, graph filled");
  } catch (error) {
    console.error(error);
  }
}

export default traverseMap;
