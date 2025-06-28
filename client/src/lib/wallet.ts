import { SUPPORTED_CHAINS } from "@/types/wallet";

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getChainById(chainId: number) {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
}

export function getChainByName(name: string) {
  return SUPPORTED_CHAINS.find(chain => chain.name === name);
}

export function isTestnetChain(chainId: number): boolean {
  const chain = getChainById(chainId);
  return chain?.isTestnet || false;
}
