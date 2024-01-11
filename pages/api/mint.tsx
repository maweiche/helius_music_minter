import { NextApiRequest, NextApiResponse } from "next";
import Irys from "@irys/sdk";
import path from "path";

const fs = require("fs");

async function post(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const fileName = 'mert'
      const audioName = 'Milkyway'
      const privateKeySecret = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
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

      const uploadImage = async () => {
        const irys = await getIrys();
        const fileToUpload = `public/${fileName}.png`;
        const token = "solana";
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

        // Upload metadata
        try {
          const response = await irys.uploadFile(fileToUpload);

          console.log(
            `File uploaded ==> https://gateway.irys.xyz/${response.id}`,
          );
          return `https://gateway.irys.xyz/${response.id}`;
        } catch (e) {
          console.log("Error uploading file ", e);
        }
      };
      const image_url = await uploadImage();

      const uploadAudio = async () => {
        const irys = await getIrys();
        
        const fileToUpload = `public/${audioName}.wav`;
        const token = "solana";
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

        // Upload metadata
        try {
          const response = await irys.uploadFile(fileToUpload);

          console.log(
            `File uploaded ==> https://gateway.irys.xyz/${response.id}`,
          );
          return `https://gateway.irys.xyz/${response.id}`;
        } catch (e) {
          console.log("Error uploading file ", e);
        }
      };
      const audio_url = await uploadAudio();

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
      return res.status(200).json({
        status: "success",
        assetId: response.assetId,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "error" });
    }
  }
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  } else if (req.method === "POST") {
    return await post(req, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
