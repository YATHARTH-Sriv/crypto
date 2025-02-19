import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    const {address} = await req.json();
    const res = await axios.post(
        process.env.ALCHEMY_SOL_API as string,
        {
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [address]
        }
      )
    return NextResponse.json(res.data);
}