const fs = require('fs');
const path = require('path');

const iconsPath = path.resolve(__dirname, '../../wegrow-clientportal-frontend/src/components/common/Icons.tsx');
let content = fs.readFileSync(iconsPath, 'utf8');

// Add upload icon to ICONS if not present
if (!content.includes('upload:')) {
  content = content.replace(
    "send: '<path d=\"m22 2-7 20-4-9-9-4z\"/><path d=\"M22 2 11 13\"/>',",
    "send: '<path d=\"m22 2-7 20-4-9-9-4z\"/><path d=\"M22 2 11 13\"/>',\n  upload: '<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12\"/>',"
  );
}

// Update ClientLogo to render logo image if available
const oldClientLogo = `export const ClientLogo: React.FC<{ client: ClientData; size?: number }> = ({ client, size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-label={\`\${client.company} logo\`}>
    <rect width="40" height="40" rx="10" fill={client.color} />
    <text
      x="20"
      y="25.5"
      textAnchor="middle"
      fontFamily="Manrope, system-ui, sans-serif"
      fontSize="14"
      fontWeight="800"
      fill="#fff"
    >
      {client.short}
    </text>
  </svg>
);`;

const newClientLogo = `export const ClientLogo: React.FC<{ client: ClientData; size?: number; className?: string }> = ({
  client,
  size = 36,
  className = ''
}) => {
  const logoHref =
    typeof client?.logo === 'string'
      ? client.logo
      : client?.logo?.url || (client?.logo?.assetId ? '/_blob/' + client.logo.assetId : null);

  if (logoHref) {
    return (
      <img
        src={logoHref}
        alt={\`\${client.company} logo\`}
        className={\`logoimg \${className}\`}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: 10,
          background: '#fff',
          border: '1px solid var(--line)',
          flexShrink: 0
        }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-label={\`\${client.company} logo\`} className={className} style={{ flexShrink: 0 }}>
      <rect width="40" height="40" rx="10" fill={client.color || '#C2410C'} />
      <text
        x="20"
        y="25.5"
        textAnchor="middle"
        fontFamily="Manrope, system-ui, sans-serif"
        fontSize="14"
        fontWeight="800"
        fill="#fff"
      >
        {client.short || client.company?.slice(0, 2).toUpperCase() || 'WG'}
      </text>
    </svg>
  );
};`;

if (content.includes('export const ClientLogo:')) {
  content = content.replace(oldClientLogo, newClientLogo);
}

fs.writeFileSync(iconsPath, content, 'utf8');
console.log('2. Updated Icons.tsx successfully');
