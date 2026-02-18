const WebSocket = require("ws");
const axios = require("axios");

const threshold = 20;
const id = 80;
let isBuying = false;
const cookie =
  "_fbp=fb.1.1771382003130.942814641583737876; _fbp=fb.1.1769015692275.22736236079249630; session=c146dac1-f9d2-47b3-8706-1287c0420659; session.sig=29uKCVeliCJepGQO0i4d-IL6jj0; _ga=GA1.1.235310253.1758883343; _ga_Z3MXP7MPYD=GS2.1.s1770272181$o1$g0$t1770272181$j60$l0$h0; _ga_RBPW36QR49=GS2.1.s1768231587$o6$g0$t1768231587$j60$l0$h0";
const headers = {
  accept: "*/*",
  "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,fr-FR;q=0.6,fr;q=0.5",
  "content-type": "application/json",
  cookie: cookie,
  Referer: "https://bigsale.lienquan.garena.vn/",
};
const ws = new WebSocket(
  "wss://bigsale.lienquan.garena.vn/graphql",
  "graphql-ws",
  {
    headers: headers,
  }
);
async function getUser() {
  try {
    const { data } = await axios.post(
      "https://bigsale.lienquan.garena.vn/graphql",
      {
        operationName: "getUser",
        variables: {},
        query: `
        query getUser {
          getUser {
            id
            name
            icon
            profile {
              id
              ...Profile
              __typename
            }
            __typename
          }
        }

        fragment Profile on Profile {
          tcid
          cpUsage
          claimedMilestones
          cp
          ownedItems
          __typename
        }
      `,
      },
      {
        headers: headers,
      }
    );
    const user = data.data.getUser;
    console.log(
      `---------------\nUser: ${user.name}\nQuân huy: ${user.profile.cp}\n---------------`
    );
    return data;
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}
getUser();
ws.on("open", () => {
  ws.send(JSON.stringify({ type: "connection_init", payload: {} }));
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  const type = msg.type;
  if (type === "connection_ack") {
    start();
  } else if (type === "data") {
    const ids = msg.payload.data.notify.ids;
    const count = ids.length;
    console.log(`Còn lại: ${count}/337`);
    if (count <= threshold && !isBuying) {
      isBuying = true;
      console.log("Đang mua...");
      doBuy(id);
    }
  }
});

function start() {
  ws.send(
    JSON.stringify({
      type: "start",
      payload: {
        variables: {},
        extensions: {},
        operationName: "watchNotify",
        query: "subscription watchNotify {\n  notify {\n    ids\n  }\n}",
      },
    })
  );
}
async function doBuy(id) {
  try {
    const { data } = await axios.post(
      "https://bigsale.lienquan.garena.vn/graphql",
      {
        operationName: "doBuy",
        variables: { id },
        query: `
        mutation doBuy($id: Int!) {
          buy(id: $id) {
            updatedProfile {
              id
              ...Profile
              __typename
            }
            history {
              ...ItemHistory
              __typename
            }
            __typename
          }
        }

        fragment Profile on Profile {
          tcid
          cpUsage
          claimedMilestones
          cp
          ownedItems
          __typename
        }

        fragment ItemHistory on ItemHistory {
          id
          source
          extra
          costStr
          itemList {
            itemId
            category
            __typename
          }
          createdAt
          __typename
        }
      `,
      },
      { headers }
    );

    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error(
      `❌ Mua item ${id} thất bại:`,
      err.response?.data || err.message
    );
  }
}
