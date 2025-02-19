import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    const {address} = await req.json();
    const res = await axios.post(
        process.env.ALCHEMY_ETH_API as string,
        // process.env.ALCHEMY_ETH_API_SEPOLIA as string,
        {
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address,"latest"]
        }
      )
    return NextResponse.json(res.data);
}