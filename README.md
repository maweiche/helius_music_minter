# Mint Music as a Compressed NFT

This is a basic example of how to mint an audio file as a compressed NFT. The app uses Helius' simple `mintCompressedNft` API endpoint to mint a compressed NFT and Irys to host the audio file + image for the cNFT.

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file in the root directory and add the following variables:
```
NEXT_PUBLIC_WALLET_PRIVATE_KEY= # Private key of the wallet you want to mint from
NEXT_PUBLIC_RPC_URL= # HELIUS RPC URL to allow you to interact with the `mintCompressedNft` API endpoint
```
3. Add an audio and image file to the `public` directory
4. Change the `fileName` and `audioName` variables in the `api/mint.tsx` to the name of your audio and image files, respectively.
5. Run `npm run dev` to start the app

## How it works

Inside the `api/mint.tsx` file on line 14 we establish the parameters for our Irys connection, since we are minting on Devnet we are using their Devnet node, however if you want to mint on Mainnet you will need to change this, you can find the list [here](https://docs.irys.xyz/overview/nodes).

This is also where we input the other necessary info for Irys to connect and pay for the uploads.

```typescript=14
const getIrys = async () => {
    const url = "https://devnet.irys.xyz";
    const token = "solana";
    const privateKey = privateKeySecret;
    const providerUrl = rpcUrl
    const irys = new Irys({
      url, // URL of the node you want to connect to
      token, // Token used for payment
      key: privateKey, //SOL private key in base58 format
      config: { providerUrl: providerUrl }, // Optional provider URL, only required when using Devnet
    });
    return irys;
};
```

For `uploadImage` and `uploadAudio` we are doing the same thing just with two different files and types. The key thing to note here are the following lines:

```typescript=63
// Get size of file
const { size } = await fs.promises.stat(fileToUpload);
// Get cost to upload "size" bytes
const price = await irys.getPrice(size);
console.log(
  `Uploading ${size} bytes costs ${irys.utils.fromAtomic(
    price,
  )} ${token}`,
);
// Fund the node
await irys.fund(price);
```

What Irys does here is gather the size of the respective file and determines the price of the upload/hosting, it then funds the node with the Private Key you are using. After upload, it returns a URL to your item on their gateway. This URL is what we then use for the Image URI and File URL.

Next, on line 89 we structure our `mintCompressedApi` call to Helius where the body of the call is the NFT metadata.

```typescript=89
const mintCompressedNft = async () => {
    const response = await fetch(rpcUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "helius-test",
        method: "mintCompressedNft",
        params: {
          name: "Audio cNFT",
          symbol: "HeliusDev",
          owner: '7wK3jPMYjpZHZAghjersW6hBNMgi9VAGr75AhYRqR2n',
          description: "Audio cNFT",
          attributes: [
            {
              trait_type: "Name",
              value: 'Milky Way Mert',
            },
            {
              trait_type: "Description",
              value: "Audio cNFT",
            },
            {
              trait_type: "Audio File",
              value: audio_url,
            }
          ],
          imageUrl: image_url,
          externalUrl: "https://www.helius.dev/blog",
          sellerFeeBasisPoints: 6500,
          creators: [
            {
              address: '7wK3jPMYjpZHZAghjersW6hBNMgi9VAGr75AhYRqR2n',
              share: 100,
            },
          ],
        },
      }),
    });
    const { result } = await response.json();
    console.log(`View on Xray: https://xray.helius.xyz/tx/${result.signature}?network=devnet`)

    return result;
};

  const response = await mintCompressedNft();
```

Compressed NFT metadata is the exact same as a regular NFT. To keep it simple we are just using Name, Description, and Audio File as traits, but you could also include other details. [Here](https://6c6wh2uz4y24gydicfdt5kkaxrjbqlctace3ciacoynz4ekfwd7a.arweave.net/8L1j6pnmNcNgaBFHPqlAvFIYLFMAibEgAnYbnhFFsP4) is the metadata of an Audio NFT on a NFT Marketplace for reference.

One thing to note, the `owner` on line 102 is where this cNFT will be airdropped to after minting.

```typescript=102
owner: '7wK3jPMYjpZHZAghjersW6hBNMgi9VAGr75AhYRqR2n',
```

Now you are ready to spin back up your app with `npm run dev` and click "Create cNFT".

If all goes as planned with the upload and mint then you will see a URL displayed to XRAY in your terminal. If something fails or there is an error then check your terminal, the error from the back-end will not appear in your browser console. 

Here is an example of how the txn will look on Xray, where you can click the cNFT and view the attributes.

![xray](https://hackmd.io/_uploads/Hk1I2tpOa.png)

Nice job! Now if you wanted to display these cNFT's on the front-end you can parse for the cNFTs by creator using the following call to [Helius'](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api/get-assets-by-creator) `getAssetsByCreator` endpoint. 

```typescript=
const response = await fetch(url!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "helius-test",
    method: "getAssetsByCreator",
    params: {
      creatorAddress: address, // Required
      onlyVerified: false, // Optional
      page: 1, // Starts at 1
      limit: 1000, // Max 1000
    },
  }),
});
```
From there you can map out the results and display the "Audio File" trait value within an `<audio />` tag.