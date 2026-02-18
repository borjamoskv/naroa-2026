/**
 * Restaurador Web3 - Mint Your Fail (Sovereign Module)
 * @description Web3 integration for minting disaster art as NFTs on Base.
 * Refactored to ES Module for Naroa-2026 architecture.
 */

// Base Mainnet configuration
export const WEB3_CONFIG = {
  CHAIN_ID: 8453, // Base Mainnet
  CHAIN_HEX: '0x2105',
  RPC_URL: 'https://mainnet.base.org',
  CHAIN_NAME: 'Base',
  EXPLORER: 'https://basescan.org',
  // Contract will be deployed - placeholder for now
  CONTRACT_ADDRESS: null,
  // Pinata IPFS Gateway
  PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  // Simulation Mode (Default to true to prevent accidental gas usage)
  SIMULATION_MODE: true
};

class RestauradorWeb3 {
  constructor() {
    this.state = {
      provider: null,
      signer: null,
      address: null,
      isConnected: false
    };
    
    // Bind methods
    this.connectWallet = this.connectWallet.bind(this);
    this.mintNFT = this.mintNFT.bind(this);
  }

  /**
   * Check if wallet is available
   */
  hasWallet() {
    return typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect wallet
   */
  async connectWallet() {
    if (WEB3_CONFIG.SIMULATION_MODE) {
      this.state.address = '0xSIMULATED_WALLET_' + Math.floor(Math.random() * 10000);
      this.state.isConnected = true;
      this.showToast('⚠️ MODO SIMULACIÓN: Wallet conectada', 'warning');
      return true;
    }

    if (!this.hasWallet()) {
      this.showToast('🦊 Instala MetaMask para mintear tu NFT', 'warning');
      window.open('https://metamask.io/download/', '_blank');
      return false;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      this.state.address = accounts[0];
      this.state.isConnected = true;

      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== WEB3_CONFIG.CHAIN_HEX) {
        await this.switchToBase();
      }

      // Create provider (ethers v6 style if available, fallback to basic)
      if (window.ethers) {
        this.state.provider = new window.ethers.BrowserProvider(window.ethereum);
        this.state.signer = await this.state.provider.getSigner();
      }

      this.showToast('✅ Wallet conectada: ' + this.formatAddress(this.state.address), 'success');
      return true;

    } catch (error) {
      console.error('Wallet connection error:', error);
      this.showToast('❌ Error conectando wallet', 'error');
      return false;
    }
  }

  /**
   * Switch to Base network
   */
  async switchToBase() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: WEB3_CONFIG.CHAIN_HEX }]
      });
    } catch (switchError) {
      // Network not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: WEB3_CONFIG.CHAIN_HEX,
              chainName: WEB3_CONFIG.CHAIN_NAME,
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [WEB3_CONFIG.RPC_URL],
              blockExplorerUrls: [WEB3_CONFIG.EXPLORER]
            }]
          });
        } catch (addError) {
          throw new Error('Añade Base manualmente a tu wallet');
        }
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Upload image to IPFS via Pinata
   */
  async uploadToIPFS(imageDataURL) {
    if (WEB3_CONFIG.SIMULATION_MODE) {
      await new Promise(r => setTimeout(r, 1500)); // Simulate delay
      return {
        success: true,
        hash: 'QmSimulatedHash' + Date.now(),
        url: imageDataURL // Return local URL for preview
      };
    }

    // Check for Pinata API key in localStorage or prompt
    let apiKey = localStorage.getItem('pinata_api_key');
    let apiSecret = localStorage.getItem('pinata_api_secret');

    if (!apiKey || !apiSecret) {
      this.showToast('⚠️ Necesitas configurar Pinata para IPFS', 'warning');
      
      // For MVP, offer direct download as alternative
      const useLocal = confirm(
        'Para mintear necesitas una cuenta de Pinata (IPFS).\n\n' +
        '¿Prefieres descargar la imagen localmente por ahora?'
      );
      
      if (useLocal) {
        return { success: false, fallback: true };
      }
      
      apiKey = prompt('Pinata API Key:');
      apiSecret = prompt('Pinata API Secret:');
      
      if (apiKey && apiSecret) {
        localStorage.setItem('pinata_api_key', apiKey);
        localStorage.setItem('pinata_api_secret', apiSecret);
      } else {
        return { success: false, fallback: true };
      }
    }

    try {
      // Convert dataURL to blob
      const response = await fetch(imageDataURL);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, `restaurador-${Date.now()}.png`);
      
      const metadata = JSON.stringify({
        name: `Restauración Desastrosa #${Date.now()}`,
        keyvalues: {
          artist: 'Naroa Gutiérrez Gil',
          game: 'El Restaurador Desastroso'
        }
      });
      formData.append('pinataMetadata', metadata);

      // Upload to Pinata
      const upload = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret
        },
        body: formData
      });

      const result = await upload.json();

      if (result.IpfsHash) {
        return { 
          success: true, 
          hash: result.IpfsHash,
          url: WEB3_CONFIG.PINATA_GATEWAY + result.IpfsHash
        };
      }

      throw new Error('IPFS upload failed');

    } catch (error) {
      console.error('IPFS upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create NFT metadata and upload
   */
  async createMetadata(imageHash) {
    if (WEB3_CONFIG.SIMULATION_MODE) {
      await new Promise(r => setTimeout(r, 800));
      return 'QmSimulatedMetadataHash';
    }

    const apiKey = localStorage.getItem('pinata_api_key');
    const apiSecret = localStorage.getItem('pinata_api_secret');

    const metadata = {
      name: `Restauración Desastrosa #${Date.now()}`,
      description: 'Arte fallido creado en El Restaurador Desastroso de Naroa Gutiérrez Gil. ¡Un crimen artístico glorioso!',
      image: `ipfs://${imageHash}`,
      external_url: 'https://naroa.online/#/restaurador',
      attributes: [
        { trait_type: 'Artista Original', value: 'Naroa Gutiérrez Gil' },
        { trait_type: 'Tipo', value: 'Restauración Desastrosa' },
        { trait_type: 'Timestamp', value: new Date().toISOString() }
      ]
    };

    try {
      const upload = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret
        },
        body: JSON.stringify(metadata)
      });

      const result = await upload.json();
      return result.IpfsHash;

    } catch (error) {
      console.error('Metadata upload error:', error);
      return null;
    }
  }

  /**
   * Mint NFT (placeholder until contract is deployed)
   */
  async mintNFT(imageDataURL) {
    this.showToast('🔄 Conectando wallet...', 'info');

    // Connect wallet
    const connected = await this.connectWallet();
    if (!connected) return;

    this.showToast('📤 Subiendo a IPFS...', 'info');

    // Upload image to IPFS
    const imageResult = await this.uploadToIPFS(imageDataURL);
    
    if (imageResult.fallback) {
      // User chose to download instead
      this.downloadImage(imageDataURL);
      return;
    }

    if (!imageResult.success) {
      this.showToast('❌ Error subiendo imagen', 'error');
      return;
    }

    this.showToast('📝 Creando metadata...', 'info');

    // Create and upload metadata
    const metadataHash = await this.createMetadata(imageResult.hash);
    
    if (!metadataHash) {
      this.showToast('❌ Error creando metadata', 'error');
      return;
    }

    // For MVP without deployed contract, show success and save IPFS link
    this.showToast('✅ ¡Arte subido a IPFS! (Simulado)', 'success');
    
    const ipfsUrl = WEB3_CONFIG.SIMULATION_MODE 
      ? 'https://ipfs.io/ipfs/' + metadataHash 
      : WEB3_CONFIG.PINATA_GATEWAY + metadataHash;
    
    // Show result modal with IPFS link
    this.showMintResult({
      imageUrl: imageResult.url,
      metadataUrl: ipfsUrl,
      address: this.state.address,
      isSimulation: WEB3_CONFIG.SIMULATION_MODE
    });
  }

  /**
   * Show mint result modal
   */
  showMintResult(result) {
    const modal = document.getElementById('result-modal');
    if (!modal) return;

    const content = modal.querySelector('.result-content');
    if (!content) return;

    content.innerHTML = `
      <h3 class="result-title">🎉 ¡Arte Inmorttalizado! ${result.isSimulation ? '(SIM)' : ''}</h3>
      <p class="result-subtitle">Tu crimen artístico está en la blockchain (IPFS)</p>
      
      <div class="result-preview">
        <img src="${result.imageUrl}" alt="Tu NFT">
      </div>
      
      <div class="mint-details">
        <a href="${result.metadataUrl}" target="_blank" class="ipfs-link">
          🔗 Ver Metadata en IPFS
        </a>
      </div>
      
      <div class="result-actions">
        <button class="action-btn action-share" onclick="window.shareNFT('${result.imageUrl}')">
          🐦 Compartir en X
        </button>
        <button class="action-btn action-retry" onclick="location.reload()">
          🔄 Crear otro desastre
        </button>
      </div>
    `;
    
    // Make helper globally available for the onclick
    window.shareNFT = this.shareNFT;
    
    modal.classList.add('active');
  }

  /**
   * Share NFT to Twitter
   */
  shareNFT(imageUrl) {
    const text = encodeURIComponent(
      `🎨💀 ¡Acabo de crear un NFT con mi "restauración desastrosa" de @NaroaGutierrezG!\n\n` +
      `Mi crimen artístico ahora es eterno 🪙\n\n` +
      `¿Puedes hacerlo peor? 👉 naroa.online/#/restaurador\n\n` +
      `#MintYourFail #NaroaArt #NFT #Base`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }

  /**
   * Helper: format address
   */
  formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Helper: download image locally
   */
  downloadImage(dataURL) {
    const link = document.createElement('a');
    link.download = `restaurador-desastroso-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    this.showToast('💾 Imagen descargada', 'success');
  }

  /**
   * Helper: show toast notification
   */
  showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.web3-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `web3-toast web3-toast--${type}`;
    toast.textContent = message;
    
    // Add simulation badge
    if (WEB3_CONFIG.SIMULATION_MODE && type !== 'warning') {
      toast.textContent += ' (SIM)';
    }

    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: ${type === 'success' ? '#69db7c' : type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffd43b' : '#4dabf7'};
      color: ${type === 'warning' ? '#1a1a1a' : 'white'};
      border-radius: 12px;
      font-weight: 600;
      z-index: 9999;
      animation: toast-in 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toast-out 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Export singleton instance
export const web3Manager = new RestauradorWeb3();
