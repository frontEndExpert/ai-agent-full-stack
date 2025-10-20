import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * @route GET /api/widget/:agentId
 * @desc Get widget configuration and script
 * @access Public
 */
router.get('/:agentId', async (req, res) => {
	try {
		const { agentId } = req.params;

		// In a real app, this would fetch agent config from database
		const agentConfig = {
			id: agentId,
			name: 'AI Assistant',
			theme: {
				primaryColor: '#3b82f6',
				backgroundColor: '#ffffff',
				textColor: '#000000',
			},
			position: 'bottom-right',
			size: 'medium',
		};

		res.json({
			success: true,
			config: agentConfig,
		});
	} catch (error) {
		console.error('Error fetching widget config:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch widget configuration',
		});
	}
});

/**
 * @route GET /api/widget/:agentId/script
 * @desc Get embeddable widget script
 * @access Public
 */
router.get('/:agentId/script', (req, res) => {
	try {
		const { agentId } = req.params;

		const script = `
(function() {
  // Widget configuration
  const config = {
    agentId: '${agentId}',
    apiUrl: '${process.env.FRONTEND_URL || 'http://localhost:3000'}',
    position: 'bottom-right',
    theme: {
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    }
  };

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'ai-agent-widget';
  widgetContainer.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: \${config.theme.primaryColor};
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  \`;

  // Create chat icon
  const chatIcon = document.createElement('div');
  chatIcon.innerHTML = '💬';
  chatIcon.style.cssText = \`
    font-size: 24px;
    color: white;
  \`;

  widgetContainer.appendChild(chatIcon);

  // Create iframe for chat interface
  const iframe = document.createElement('iframe');
  iframe.id = 'ai-agent-iframe';
  iframe.src = \`\${config.apiUrl}/widget/\${config.agentId}\`;
  iframe.style.cssText = \`
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 350px;
    height: 500px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    z-index: 10001;
    display: none;
    background: white;
  \`;

  // Toggle chat visibility
  let isOpen = false;
  widgetContainer.addEventListener('click', function() {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? 'block' : 'none';
    
    // Update widget appearance
    if (isOpen) {
      widgetContainer.style.background = '#ef4444';
      chatIcon.innerHTML = '✕';
    } else {
      widgetContainer.style.background = config.theme.primaryColor;
      chatIcon.innerHTML = '💬';
    }
  });

  // Add to page
  document.body.appendChild(widgetContainer);
  document.body.appendChild(iframe);

  // Handle messages from iframe
  window.addEventListener('message', function(event) {
    if (event.origin !== config.apiUrl) return;
    
    if (event.data.type === 'close') {
      isOpen = false;
      iframe.style.display = 'none';
      widgetContainer.style.background = config.theme.primaryColor;
      chatIcon.innerHTML = '💬';
    }
  });

  console.log('AI Agent Widget loaded for agent:', config.agentId);
})();
`;

		res.setHeader('Content-Type', 'application/javascript');
		res.send(script);
	} catch (error) {
		console.error('Error generating widget script:', error);
		res.status(500).send('// Error loading widget script');
	}
});

/**
 * @route GET /api/widget/:agentId/embed
 * @desc Get HTML embed code
 * @access Public
 */
router.get('/:agentId/embed', (req, res) => {
	try {
		const { agentId } = req.params;
		const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

		const embedCode = `<!-- AI Agent Widget -->
<script src="${baseUrl}/api/widget/${agentId}/script"></script>
<!-- End AI Agent Widget -->`;

		res.json({
			success: true,
			embedCode: embedCode,
			instructions:
				'Copy and paste this code into your website before the closing </body> tag',
		});
	} catch (error) {
		console.error('Error generating embed code:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to generate embed code',
		});
	}
});

export default router;
