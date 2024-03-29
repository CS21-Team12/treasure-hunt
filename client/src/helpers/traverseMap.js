/**
 * Dependencies
 */

import axiosWithAuth from "./axiosWithAuth";
import {
  wait,
  moveWithPerks,
  pickItem,
  sellTreasures,
  pickUpAllPerks,
  movePlayerToDestination,
  examineWishingWell
} from "./util";

import { baseUrl } from "./constants";

const reverseDirection = {
  n: "s",
  s: "n",
  e: "w",
  w: "e"
};

async function traverseMap(callback = undefined) {
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

      switch (prevRoomID) {
        case 1:
          await sellTreasures();
          break;
      }

      let moveRes = null;
      if (callback) {
        moveRes = await moveWithPerks(prevRoomID, direction, callback);
      } else {
        moveRes = await moveWithPerks(prevRoomID, direction);
      }

      currentRoomID = moveRes.data.room_id;
      if (!(currentRoomID in traversalGraph)) {
        traversalGraph[currentRoomID] = moveRes.data;
        for (let i = 0; i < moveRes.data.exits.length; i++) {
          traversalGraph[currentRoomID][moveRes.data.exits[i]] = "?";
        }
      }
      traversalGraph[prevRoomID][direction] = currentRoomID;
      traversalGraph[currentRoomID][reverseDirection[direction]] = prevRoomID;

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
