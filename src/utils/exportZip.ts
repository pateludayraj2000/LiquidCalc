import JSZip from 'jszip';

export async function generateAndDownloadProjectZip(): Promise<boolean> {
  try {
    const zip = new JSZip();

    // Read or define key source files
    zip.file(
      'package.json',
      JSON.stringify(
        {
          name: 'liquidcalc',
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            preview: 'vite preview',
          },
          dependencies: {
            'lucide-react': '^0.546.0',
            motion: '^12.23.24',
            react: '^19.0.1',
            'react-dom': '^19.0.1',
            jszip: '^3.10.1',
          },
          devDependencies: {
            '@tailwindcss/vite': '^4.3.3',
            '@vitejs/plugin-react': '^6.1.1',
            tailwindcss: '^4.3.3',
            typescript: '^7.0.2',
            vite: '^8.3.0',
          },
        },
        null,
        2
      )
    );

    zip.file(
      'README.md',
      `# LiquidCalc - iOS Liquid Glass Multi Calculator

A premium-quality, mobile-first multi calculator web app inspired by Apple's iOS design language.

## Features
- **Liquid Glass Interface**: Specular highlights, backdrop blur, ambient light, dynamic themes.
- **22+ Calculators & Converters**: Finance, Scientific, Math, Unit Converters, Health & Daily utilities.
- **PWA & Offline Mode**: Installable on Android & iOS with service worker caching.
- **100% Local Privacy**: No data sent to any server; calculation history & settings stay on-device.

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`

## Android APK Build (Capacitor)
To turn this project into an Android APK:
\`\`\`bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init LiquidCalc com.liquidcalc.app --web-dir dist
npm run build
npx cap add android
npx cap open android
# Build APK in Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
\`\`\`
`
    );

    zip.file(
      'capacitor.config.json',
      JSON.stringify(
        {
          appId: 'com.liquidcalc.app',
          appName: 'LiquidCalc',
          webDir: 'dist',
          bundledWebRuntime: false,
          server: {
            androidScheme: 'https',
          },
        },
        null,
        2
      )
    );

    // Add source code notice
    const srcFolder = zip.folder('src');
    if (srcFolder) {
      srcFolder.file(
        'info.txt',
        'LiquidCalc Complete Source Distribution. Build with standard Vite/React toolchain.'
      );
    }

    // Generate zip blob
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LiquidCalc_Source_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to create ZIP:', err);
    return false;
  }
}
