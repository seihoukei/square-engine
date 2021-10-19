export default function Randomizer(seed) {
    if (seed === undefined)
        seed = Math.random()

    const random = () => {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
    }

    random.seed = seed

    seed *= 2 ** 32

    return random
}

