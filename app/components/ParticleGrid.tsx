"use client";

import React, { useEffect, useRef } from "react";

export function ParticleGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        // Default mouse slightly off-center for initial look
        let mouseX = width * 0.7;
        let mouseY = height * 0.3;
        let targetMouseX = mouseX;
        let targetMouseY = mouseY;

        const handleMouseMove = (e: MouseEvent) => {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        };

        window.addEventListener("mousemove", handleMouseMove);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        };
        window.addEventListener("resize", handleResize);

        const spacing = 45; // Space between dashes

        class Particle {
            x: number;
            y: number;
            baseX: number;
            baseY: number;
            angle: number;
            color: string;
            scale: number;

            constructor(x: number, y: number, color: string) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.angle = 0;
                this.color = color;
                this.scale = 1;
            }

            update(mx: number, my: number) {
                const dx = mx - this.baseX;
                const dy = my - this.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Angle to mouse + 90 degrees (Math.PI / 2) creates the concentric wave/magnetic field look
                const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;

                this.angle = targetAngle;

                // Scale up when cursor is near
                const maxDist = 400;
                if (distance < maxDist) {
                    const effect = 1 - Math.pow(distance / maxDist, 2); // Ease out
                    this.scale = 1 + effect * 1.5; // Max 2.5x length
                } else {
                    this.scale = 1;
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.save();
                ctx.translate(this.baseX, this.baseY);
                ctx.rotate(this.angle);

                ctx.fillStyle = this.color;

                // Closer particles glow slightly more opaque
                ctx.globalAlpha = 0.4 + (this.scale - 1) * 0.4;

                ctx.beginPath();
                const dashLength = 10 * this.scale;
                const dashThickness = 2.5;

                // Fallback for browsers that don't support roundRect
                if (ctx.roundRect) {
                    ctx.roundRect(-dashLength / 2, -dashThickness / 2, dashLength, dashThickness, dashThickness / 2);
                } else {
                    ctx.rect(-dashLength / 2, -dashThickness / 2, dashLength, dashThickness);
                }
                ctx.fill();

                ctx.restore();
            }
        }

        let particles: Particle[] = [];

        const initParticles = () => {
            particles = [];
            for (let y = -spacing; y < height + spacing; y += spacing) {
                for (let x = -spacing; x < width + spacing; x += spacing) {
                    // Generate colors similar to the reference: blues, purples, reds
                    const xRatio = x / width;
                    const yRatio = y / height;

                    // Creates a gradient of hues from Top-Left to Bottom-Right
                    const hue = 220 + (xRatio * 60) + (yRatio * 80); // 220 is Blue, 360 is Red/Pink

                    const color = `hsl(${hue}, 85%, 65%)`;
                    particles.push(new Particle(x, y, color));
                }
            }
        };

        initParticles();

        let animationFrameId: number;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Smoothly lerp the mouse coordinates to make the wave transition buttery
            mouseX += (targetMouseX - mouseX) * 0.08;
            mouseY += (targetMouseY - mouseY) * 0.08;

            for (let i = 0; i < particles.length; i++) {
                particles[i].update(mouseX, mouseY);
                particles[i].draw(ctx);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0,
            }}
        />
    );
}
