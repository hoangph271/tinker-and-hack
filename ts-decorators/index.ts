// * Class decorator
function PrettyPrinted(constructor: Function) {
    constructor.prototype.prettyPrint = function () {
        console.info('@-- prettyPrint ---')
        console.info(constructor)
        console.info('#-- prettyPrint ---')
    }
}

// * Property decorator
function Glorified() {
    return function (target: Object, key: string | symbol) {
        let val = target[key]

        Object.defineProperty(target, key, {
            get() {
                return `${val}...!`
            },
            set(nextVal) {
                val = nextVal
            },
            enumerable: true,
            configurable: true
        })
    }
}

// * Method decorator
function Encrypted(keyLength: number = 32) {
    return function (_target: Object, _key: string | symbol, descriptor: PropertyDescriptor) {
        const original = descriptor.value

        descriptor.value = function (...args: any[]) {
            const crypto = require('crypto')
            const key = crypto.randomBytes(keyLength)
            const iv = crypto.randomBytes(16)

            function encrypt(text) {
                let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)

                let encrypted;
                try {
                    encrypted = cipher.update(text)
                } catch (error) {
                    encrypted = cipher.update(text.toString())
                }

                encrypted = Buffer.concat([encrypted, cipher.final()])
                return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
            }

            return {
                iv,
                key,
                data: encrypt(original.call(this, ...args)),
            }
        }

        return descriptor
    }
}

// * Getter decorator
function Doubled() {
    return function (_target: Object, _key: string | symbol, descriptor: PropertyDescriptor) {
        const original = descriptor.get

        descriptor.get = function (...args: any[]) {
            return original.call(this, ...args) * 2
        }

        return descriptor
    }
}

(async () => {
    @PrettyPrinted
    class Boi {
        @Glorified()
        name: string
        age: number

        constructor({ name = 'A random boi', age = 25 } = {}) {
            this.name = name
            this.age = age
        }

        @Encrypted()
        encryptedName() {
            return this.name
        }

        @Encrypted(32)
        encryptedAge() {
            return this.age
        }

        @Doubled()
        get doubledAge () {
            return this.age
        }
    }

    const boi = new Boi() as any

    // boi.prettyPrint()

    // console.info(boi.name)

    // console.info(await boi.encryptedName())
    // console.info(await boi.encryptedAge())

    console.info(boi.doubledAge)
})()
