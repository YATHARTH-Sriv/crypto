import * as borsh from "borsh"

export class Counter_Test{
    count:number

    constructor({count}:{count:number}){
        this.count=count
    }
}

export const schema: borsh.Schema={
    struct:{
        count:"u32"
    }
}

export const COUNTER_SIZE=borsh.serialize(schema,new Counter_Test({ count:0})).length
console.log(COUNTER_SIZE)