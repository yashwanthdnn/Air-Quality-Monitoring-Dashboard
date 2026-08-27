import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeAtmosphere = ({ aqi = 40, category = 'good' }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Color logic based on AQI (strictly warm light / green / gold / terracotta / plum)
    let primaryColorHex = 0x2E7D32; // Emerald green
    let particleCount = 700;
    let particleSpeed = 0.003;
    let turbulence = 0.01;

    if (aqi > 200) {
      primaryColorHex = 0x6B21A8; // Deep plum
      particleCount = 1400;
      particleSpeed = 0.012;
      turbulence = 0.04;
    } else if (aqi > 150) {
      primaryColorHex = 0xC62828; // Crimson
      particleCount = 1200;
      particleSpeed = 0.009;
      turbulence = 0.03;
    } else if (aqi > 100) {
      primaryColorHex = 0xD96B43; // Terracotta / Amber
      particleCount = 950;
      particleSpeed = 0.006;
      turbulence = 0.02;
    } else if (aqi > 50) {
      primaryColorHex = 0xD97706; // Warm Ochre
      particleCount = 800;
      particleSpeed = 0.004;
      turbulence = 0.015;
    }

    const brandColor = new THREE.Color(primaryColorHex);

    // 1. Central Core Sphere (Atmosphere Core)
    const coreGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: brandColor,
      emissive: brandColor,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.18,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Inner glowing solid sphere
    const innerGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.6
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // 2. Swirling Atmospheric Particles (PM2.5 / Air molecules)
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const scaleArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Spherical distribution around core
      const radius = 1.9 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = radius * Math.cos(phi);

      scaleArray[i / 3] = Math.random();
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.06,
      color: brandColor,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 3. Orbital Ring
    const ringGeo = new THREE.TorusGeometry(2.6, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: brandColor,
      transparent: true,
      opacity: 0.35
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(primaryColorHex, 2.5, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.5;
      targetY = y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate central sphere
      coreMesh.rotation.y = elapsedTime * particleSpeed * 2 + mouseX;
      coreMesh.rotation.x = elapsedTime * 0.005 + mouseY;

      // Pulse inner sphere scale
      const pulse = 1 + Math.sin(elapsedTime * 2) * 0.04;
      innerMesh.scale.set(pulse, pulse, pulse);

      // Rotate particle cloud
      particlesMesh.rotation.y = elapsedTime * particleSpeed * 3 + mouseX * 0.8;
      particlesMesh.rotation.x = elapsedTime * turbulence + mouseY * 0.8;

      // Rotate ring
      ringMesh.rotation.z = elapsedTime * 0.01;
      ringMesh.rotation.y = mouseX * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [aqi, category]);

  return (
    <div 
      ref={mountRef} 
      style={{
        width: '100%',
        height: '240px',
        position: 'relative',
        cursor: 'grab'
      }}
      title="3D Atmospheric Simulation - Move mouse to rotate"
    />
  );
};

export default ThreeAtmosphere;
