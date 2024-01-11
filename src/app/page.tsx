"use client";

const Page: React.FC = () => {
  async function convertAndSubmit() {
    try {
      console.log("minting business card");
      const res = await fetch("/api/mint", {
        method: "POST"
      });
      console.log("res", res);
      const response_status = res.status;
      if (response_status === 200) {
        console.log("business card minted, check terminal");
      } else if (response_status === 500) {
        console.log("error minting business card");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen w-screen bg-gradient-to-r from-orange-400 to-orange-700">
      
        <h1 className="text-4xl font-bold text-white">
          Helius Music Minter
        </h1>
        <button
          className="bg-red-700 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit"
          onClick={() => convertAndSubmit()}
        >
          Create cNFT
        </button>
     
    </div>
  );
};

export default Page;
