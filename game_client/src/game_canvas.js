import React, { Suspense, useRef, useState, useMemo, Fragment } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useUpdate } from 'react-three-fiber'
import bold from './fonts/helvetiker.blob'

const Box = (props) => {
    // This reference will give us direct access to the mesh
    const player = useRef()
    const facing = useRef()
    const nameGroup = useRef()
    const nameLabel = useRef()

    const font = useLoader(THREE.FontLoader, bold)
    const config = useMemo(
        () => ({
            font,
            size: 40,
            height: 30,
            curveSegments: 32,
            bevelEnabled: true,
            bevelThickness: 6,
            bevelSize: 2.5,
            bevelOffset: 0,
            bevelSegments: 8,
        }),
        [font]
    )

    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    // Rotate mesh every frame, this is outside of React without overhead
    useFrame(() => (player.current.rotation.x = player.current.rotation.y += 0.01))

    const lerp = (a, b, t) => {
        return a + (b - a) * t;
    }

    const targetPlayerPosition = {
        x: props.player.x * 0.3,
        y: props.player.y * -0.3
    }

    useFrame(() => {
        player.current.position.x = lerp(player.current.position.x, targetPlayerPosition.x, 0.1)
        player.current.position.y = lerp(player.current.position.y, targetPlayerPosition.y, 0.1)
        const size = new THREE.Vector3()
        nameLabel.current.geometry.computeBoundingBox()
        nameLabel.current.geometry.boundingBox.getSize(size)
        nameGroup.current.position.x = player.current.position.x - size.x * 0.002
        nameGroup.current.position.y = player.current.position.y - size.y * 0.002
        nameGroup.current.position.z = 0.55
    })

    const fx = props.player.facing === 3 ? 1 : props.player.facing === 2 ? -1 : 0;
    const fy = props.player.facing === 0 ? 1 : props.player.facing === 1 ? -1 : 0;
    const dist = 0.6
    const targetFacingPos = {
        x: props.player.x * 0.3 + fx * dist,
        y: props.player.y * -0.3 + fy * dist
    };

    useFrame(() => {
        facing.current.position.x = lerp(facing.current.position.x, targetFacingPos.x, 0.1)
        facing.current.position.y = lerp(facing.current.position.y, targetFacingPos.y, 0.1)
    })

    return (
        <Fragment>
            <mesh
                ref={player}
                scale={active ? [0.8, 0.8, 0.8] : [0.6, 0.6, 0.6]}
                onClick={e => setActive(!active)}
                onPointerOver={e => setHover(true)}
                onPointerOut={e => setHover(false)}>
                <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} />
            </mesh>
            <mesh
                ref={facing}
                scale={[0.3, 0.3, 0.3]}>
                <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                <meshStandardMaterial attach="material" color={'red'} />
            </mesh>
            <group ref={nameGroup} scale={[0.01, 0.01, 0.002]}>
                <mesh ref={nameLabel}>
                    <textGeometry attach="geometry" args={[props.player.name, config]} />
                    <meshNormalMaterial attach="material" />
                </mesh>
            </group>
        </Fragment >
    )
}

const Bullet = (props) => {
    const mesh = useRef()

    const startPos = {
        x: (props.bullet.startX + 0.25) * 0.3 + props.bullet.dx,
        y: (props.bullet.startY + 0.25) * -0.3 - props.bullet.dy
    }

    const velocity = {
        x: props.bullet.dx * 0.01,
        y: props.bullet.dy * -0.01
    }

    useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.09))
    useFrame(() => {
        const age = (Date.now() - props.bullet.startTime)
        mesh.current.position.x = startPos.x + velocity.x * age
        mesh.current.position.y = startPos.y + velocity.y * age
    })

    return (
        <mesh
            ref={mesh}
            position={[startPos.x, startPos.y, 0.0]}
            scale={[0.3, 0.3, 0.3]}>
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshStandardMaterial attach="material" color={'gray'} />
        </mesh>
    )
}

export const GameCanvas = (props) => (
    <Canvas>
        <Suspense fallback={null}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            {
                props.gameState.players.map(p => <Box player={p} key={p.playerKey} />)
            }
            {
                props.gameState.bullets.map(b => <Bullet bullet={b} key={b.bulletKey} />)
            }
        </Suspense>
    </Canvas>
)
