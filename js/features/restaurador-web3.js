/**
 * Restaurador Web3 - Mint Your Fail
 * @description Web3 integration for minting disaster art as NFTs on Base
 */
(function() {
  'use strict';

  // Base Mainnet configuration
  const CONFIG = {
    CHAIN_ID: 8453, // Base Mainnet
    CHAIN_HEX: '0x2105',
    RPC_URL: 'https://mainnet.base.org',
    CHAIN_NAME: 'Base',
    EXPLORER: 'https://basescan.org',
    // Contract will be deployed - placeholder for now
    CONTRACT_ADDRESS: null,
    // Pinata IPFS Gateway
    PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs/'
  };

  let state = {
    provider: null,
    signer: null,
    address: null,
    isConnected: false
  };

  /**
   * Check if wallet is available
   */
  function hasWallet() {
    return typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect wallet
   */
  async function connectWallet() {
    if (!hasWallet()) {
      showToast('🦊 Instala MetaMask para mintear tu NFT', 'warning');
      window.open('https://metamask.io/download/', '_blank');
      return false;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      state.address = accounts[0];
      state.isConnected = true;

      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== CONFIG.CHAIN_HEX) {
        await switchToBase();
      }

      // Create provider (ethers v6 style if available, fallback to basic)
      if (window.ethers) {
        state.provider = new window.ethers.BrowserProvider(window.ethereum);
        state.signer = await state.provider.getSigner();
      }

      showToast('✅ Wallet conectada: ' + formatAddress(state.address), 'success');
      return true;

    } catch (error) {
      console.error('Wallet connection error:', error);
      showToast('❌ Error conectando wallet', 'error');
      return false;
    }
  }

  /**
   * Switch to Base network
   */
  async function switchToBase() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONFIG.CHAIN_HEX }]
      });
    } catch (switchError) {
      // Network not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: CONFIG.CHAIN_HEX,
              chainName: CONFIG.CHAIN_NAME,
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [CONFIG.RPC_URL],
              blockExplorerUrls: [CONFIG.EXPLORER]
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
  async function uploadToIPFS(imageDataURL) {
    // Check for Pinata API key in localStorage or prompt
    let apiKey = localStorage.getItem('pinata_api_key');
    let apiSecret = localStorage.getItem('pinata_api_secret');

    if (!apiKey || !apiSecret) {
      showToast('⚠️ Necesitas configurar Pinata para IPFS', 'warning');
      
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
          url: CONFIG.PINATA_GATEWAY + result.IpfsHash
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
  async function createMetadata(imageHash) {
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
  async function mintNFT(imageDataURL) {
    showToast('🔄 Conectando wallet...', 'info');

    // Connect wallet
    const connected = await connectWallet();
    if (!connected) return;

    showToast('📤 Subiendo a IPFS...', 'info');

    // Upload image to IPFS
    const imageResult = await uploadToIPFS(imageDataURL);
    
    if (imageResult.fallback) {
      // User chose to download instead
      downloadImage(imageDataURL);
      return;
    }

    if (!imageResult.success) {
      showToast('❌ Error subiendo imagen', 'error');
      return;
    }

    showToast('📝 Creando metadata...', 'info');

    // Create and upload metadata
    const metadataHash = await createMetadata(imageResult.hash);
    
    if (!metadataHash) {
      showToast('❌ Error creando metadata', 'error');
      return;
    }

    // For MVP without deployed contract, show success and save IPFS link
    showToast('✅ ¡Arte subido a IPFS!', 'success');
    
    const ipfsUrl = CONFIG.PINATA_GATEWAY + metadataHash;
    
    // Show result modal with IPFS link
    showMintResult({
      imageUrl: imageResult.url,
      metadataUrl: ipfsUrl,
      address: state.address
    });

    // TODO: When contract is deployed, add actual minting:
    // const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, state.signer);
    // const tx = await contract.mintFail(`ipfs://${metadataHash}`);
    // await tx.wait();
  }

  /**
   * Show mint result modal
   */
  function showMintResult(result) {
    const modal = document.getElementById('result-modal');
    if (!modal) return;

    const content = modal.querySelector('.result-content');
    if (!content) return;

    content.innerHTML = `
      <h3 class="result-title">🎉 ¡Arte Inmorttalizado!</h3>
      <p class="result-subtitle">Tu crimen artístico está en la blockchain (IPFS)</p>
      
      <div class="result-preview">
        <img src="${result.imageUrl}" alt="Tu NFT">
      </div>
      
      <div class="mint-details">
        <a href="${result.metadataUrl}" target="_blank" class="ipfs-link">
          🔗 Ver en IPFS
        </a>
      </div>
      
      <div class="result-actions">
        <button class="action-btn action-share" onclick="window.RestauradorWeb3.shareNFT('${result.imageUrl}')">
          🐦 Compartir en X
        </button>
        <button class="action-btn action-retry" onclick="location.reload()">
          🔄 Crear otro desastre
        </button>
      </div>
    `;
  }

  /**
   * Share NFT to Twitter
   */
  function shareNFT(imageUrl) {
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
  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Helper: download image locally
   */
  function downloadImage(dataURL) {
    const link = document.createElement('a');
    link.download = `restaurador-desastroso-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    showToast('💾 Imagen descargada', 'success');
  }

  /**
   * Helper: show toast notification
   */
  function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.web3-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `web3-toast web3-toast--${type}`;
    toast.textContent = message;
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
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toast-out 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Add toast animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toast-out {
      from { opacity: 1; transform: translateX(-50%) translateY(0); }
      to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    .mint-details { margin: 16px 0; }
    .ipfs-link {
      color: #4dabf7;
      text-decoration: none;
      font-weight: 600;
    }
    .ipfs-link:hover { text-decoration: underline; }
  `;
  document.head.appendChild(style);

  // Export
  window.RestauradorWeb3 = {
    connectWallet,
    mintNFT,
    shareNFT,
    hasWallet,
    get isConnected() { return state.isConnected; },
    get address() { return state.address; }
  };
})();
