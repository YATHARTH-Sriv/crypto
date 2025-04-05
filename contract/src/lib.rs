use borsh::{BorshDeserialize,BorshSerialize};

use solana_program::{
    account_info::{next_account_info,AccountInfo},
    msg,
    entrypoint,
    pubkey::Pubkey,
    entrypoint::ProgramResult

};


#[derive(BorshDeserialize,BorshSerialize,Debug)]
enum InstructionType{
    Increament(u32),
    Decreament(u32)
}

#[derive(BorshDeserialize,BorshSerialize,Debug)]
struct Counter{
    count:u32
}

entrypoint!(counter_contract);

pub fn counter_contract(
    program_id:&Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
)-> ProgramResult {
    let mut iter=accounts.iter();
    let acc=next_account_info(&mut iter)?;
    let instructiontype= InstructionType::try_from_slice(instruction_data)?;
    let mut count_val=Counter::try_from_slice(&acc.data.borrow())?;

    match instructiontype{
          InstructionType::Increament(value)=>{
            msg!("increasing the value");
              count_val.count=count_val.count+ value;
          }
          InstructionType::Decreament(value)=>{
            msg!("decreasing the value");
            count_val.count-= value;
        }
    }

    count_val.serialize(&mut *acc.data.borrow_mut())?;
    msg!("{:?}",acc);
    msg!("{:?}",instructiontype);
    msg!("contract execution completed");
    Ok(())
}