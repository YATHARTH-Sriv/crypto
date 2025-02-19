"use client"
import {  useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Toaster, toast } from "react-hot-toast"
import { SiSolana, SiEthereum } from "react-icons/si"
import { generateMnemonic, mnemonicToSeedSync } from "bip39"
import { derivePath } from "ed25519-hd-key"
import { Keypair, type PublicKey } from "@solana/web3.js"
import nacl from "tweetnacl"
import { ethers } from "ethers"
import axios from "axios"

interface Balance {
  address: string;
  balance: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
}

function Page() {
  const [mnemonic, setMnemonic] = useState<string>("")
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [blurMnemonic, setBlurMnemonic] = useState(false)
  const [solPublicKeys, setSolPublicKeys] = useState<PublicKey[]>([])
  const [ethAddresses, setEthAddresses] = useState<string[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  const generateNewMnemonic = () => {
    const mn = generateMnemonic()
    setMnemonic(mn)
    setSolPublicKeys([])
    setEthAddresses([])
    setShowMnemonic(true)
    toast.success("New mnemonic generated!", {
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #333'
      }
    })
  }

  const copyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic)
    toast.success("Mnemonic copied!", {
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #333'
      }
    })
  }

  const generateSOL = async () => {
    if (!mnemonic) return
    const seed = mnemonicToSeedSync(mnemonic)
    const newAddress = []
    const path = `m/44'/501'/${solPublicKeys.length}'/0'`
    try {
      const derivedSeed = derivePath(path, seed.toString("hex"))
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed.key).secretKey
      const keypair = Keypair.fromSecretKey(secret)
      newAddress.push(keypair.publicKey)
    } catch (error) {
      console.error(`Error generating Solana address:`, error)
      toast.error("Failed to generate address", {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333'
        }
      })
    }
    setSolPublicKeys([...solPublicKeys, ...newAddress])
  }

  const getBalance = async (key: string) => {
    setLoading(key)
    try {
      const res = await axios.post(
        "/api/sol",{
          address: key
        }
      )
      
      const balance = res.data.result.value / 1e9

      setBalances(prev => {
        const exists = prev.findIndex(b => b.address === key)
        if (exists >= 0) {
          const updated = [...prev]
          updated[exists] = { address: key, balance }
          return updated
        }
        return [...prev, { address: key, balance }]
      })
      
      toast.success("Balance updated", {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333'
        }
      })
    } catch (error) {
      console.error("Error fetching balance:", error)
      toast.error("Failed to fetch balance", {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333'
        }
      })
    } finally {
      setLoading(null)
    }
  }

  const getethBalance = async (key: string) => {
    setLoading(key)
    try {
      const res = await axios.post(
        "/api/eth",{
          address: key
        }
      )
      console.log("ethapires",res.data)
      const balance = res.data.result / 1e18

      setBalances(prev => {
        const exists = prev.findIndex(b => b.address === key)
        if (exists >= 0) {
          const updated = [...prev]
          updated[exists] = { address: key, balance }
          return updated
        }
        return [...prev, { address: key, balance }]
      })
      
      toast.success("Balance updated", {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333'
        }
      })
    } catch (error) {
      console.error("Error fetching balance:", error)
      toast.error("Failed to fetch balance", {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333'
        }
      })
    } finally {
      setLoading(null)
    }
  }

  const generateETH = async () => {
    if (!mnemonic) return
    const mnemonicObject = ethers.Mnemonic.fromPhrase(mnemonic)
    // const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonicObject)
    const newAddress = []
    try {
      const path = `m/44'/60'/0'/0/${ethAddresses.length}`
      const derivedWallet = ethers.HDNodeWallet.fromMnemonic(mnemonicObject, path)
      newAddress.push(derivedWallet.address)
    } catch (error) {
      console.error(`Error generating Ethereum address:`, error)
      toast.error("Failed to generate address", {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333'
        }
      })
    }
    setEthAddresses([...ethAddresses, ...newAddress])
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <Toaster position="top-right" />
      
      <motion.header 
        className="flex justify-between items-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white">
          CryptoWall
        </h1>
        <motion.button
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          onClick={generateNewMnemonic}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-white/20"
        >
          Generate Mnemonic
        </motion.button>
      </motion.header>

      <AnimatePresence mode="wait">
        {showMnemonic && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-900 p-8 rounded-xl mb-8 relative backdrop-blur-sm border border-white/10"
          >
            <h2 className="text-xl font-semibold mb-6">Mnemonic Phrase</h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid grid-cols-3 gap-4 mb-6 ${blurMnemonic ? "blur-sm" : ""}`}
            >
              {mnemonic.split(" ").map((word, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-zinc-800 p-3 rounded-lg text-center border border-white/5"
                >
                  {word}
                </motion.div>
              ))}
            </motion.div>
            <div className="flex justify-between">
              <motion.button
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setBlurMnemonic(!blurMnemonic)}
                className="text-white/80 hover:text-white transition-colors"
              >
                {blurMnemonic ? "Reveal" : "Hide"} Phrase
              </motion.button>
              <motion.button
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                onClick={copyMnemonic}
                className="text-white/80 hover:text-white transition-colors"
              >
                Copy Phrase
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <SiSolana className="mr-2 opacity-50" />
            Solana Addresses
          </h2>
          <motion.button
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            onClick={generateSOL}
            className="bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-300 mb-6 w-full"
            disabled={!mnemonic}
          >
            Generate Solana Address
          </motion.button>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {solPublicKeys.map((key, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  layout
                  className="bg-zinc-900 p-6 rounded-xl mb-4 border border-white/10 backdrop-blur-sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 font-medium">Account {index}</span>
                      <span className="font-mono text-sm text-white/80 truncate">{key.toBase58()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      {balances.find(b => b.address === key.toBase58()) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-white font-medium"
                        >
                          {balances.find(b => b.address === key.toBase58())?.balance.toFixed(4)} SOL
                        </motion.span>
                      )}
                      <motion.button
                        variants={buttonVariants}
                        initial="idle"
                        whileHover="hover"
                        whileTap="tap"
                        className="text-white/80 hover:text-white transition-colors relative"
                        onClick={() => getBalance(key.toBase58())}
                        disabled={loading === key.toBase58()}
                      >
                        {loading === key.toBase58() ? (
                          <motion.div
                            className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          "Refresh Balance"
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <SiEthereum className="mr-2 opacity-50" />
            Ethereum Addresses
          </h2>
          <motion.button
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            onClick={generateETH}
            className="bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-300 mb-6 w-full"
            disabled={!mnemonic}
          >
            Generate Ethereum Address
          </motion.button>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {ethAddresses.map((address, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  layout
                  className="bg-zinc-900 p-6 rounded-xl mb-4 border border-white/10 backdrop-blur-sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 font-medium">Account {index}</span>
                      <span className="font-mono text-sm text-white/80 truncate">{address}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      {balances.find(b => b.address === address) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-white font-medium"
                        >
                          {balances.find(b => b.address === address)?.balance.toFixed(4)} ETH
                        </motion.span>
                      )}
                      <motion.button
                        variants={buttonVariants}
                        initial="idle"
                        whileHover="hover"
                        whileTap="tap"
                        className="text-white/80 hover:text-white transition-colors relative"
                        onClick={() => getethBalance(address)}
                        disabled={loading === address}
                      >
                        {loading === address ? (
                          <motion.div
                            className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          "Refresh Balance"
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Page