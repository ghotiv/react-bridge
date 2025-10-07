import { sepolia, baseSepolia, bscTestnet, polygonAmoy, zksyncSepoliaTestnet,blastSepolia } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'

// Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694" // this is a public projectId only to use on localhost

// Create a metadata object - optional
export const metadata = {
  name: 'Cross Chain Bridge',
  description: 'Cross Chain Bridge Application',
  url: 'https://bridge.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

export const networks = [sepolia, baseSepolia, zksyncSepoliaTestnet, polygonAmoy, bscTestnet,blastSepolia] as [AppKitNetwork, ...AppKitNetwork[]]

export const ethersAdapter = new EthersAdapter();
