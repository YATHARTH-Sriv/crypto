import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import {expect, test} from "bun:test"
import { COUNTER_SIZE, schema } from "./types"
import * as borsh from "borsh"


const AdminAcc=Keypair.generate()
const DataAcc= Keypair.generate()
test("Account is intiated",async ()=>{
   const connection=new Connection("http://127.0.0.1:8899");
   const res=await connection.requestAirdrop(AdminAcc.publicKey,1 * LAMPORTS_PER_SOL)
   await connection.confirmTransaction(res)
   console.log(res)
   const newdata=await connection.getAccountInfo(AdminAcc.publicKey)
   console.log(newdata)
   const programid= new PublicKey("92iqwdPBDa7r1KzWkEvBVqkVyKLS3M5qyaZjxVN65KYQ")
   const lamports=await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE)
   const createacctxn=await SystemProgram.createAccount({
    fromPubkey:AdminAcc.publicKey,
    newAccountPubkey:DataAcc.publicKey,
    lamports,
    programId:programid,
    space:COUNTER_SIZE
})
   const txn=new Transaction()
   txn.add(createacctxn)
   const sendtrx=await connection.sendTransaction(txn,[AdminAcc,DataAcc]) // in signer we need dataacc as well so that blockchain knows that you only are creating a account you cannot create a account for someoneelxe
   await connection.confirmTransaction(sendtrx)
   console.log(DataAcc.publicKey.toBase58())

   const dataaccinfo=await connection.getAccountInfo(DataAcc.publicKey)
   console.log(dataaccinfo)
   const counterdata=borsh.deserialize(schema,dataaccinfo?.data)
   console.log(counterdata.count)
   expect(counterdata.count).toBe(0)
})