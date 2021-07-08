module.exports = {
    commands: ['add', 'addition'],
    expectedArgs: '<num1> <num2>',
    permissionError: 'You need admin permissions to run this command',
    minArgs: 2,
    maxArgs: 2,
    callback: (message, arguments, text) => {
        // Add the numbers
        //console.log(arguments)
        const num1 = +arguments[0] // convierte a número
        const num2 = +arguments[1]

        message.reply(`The sum is ${num1 + num2}`)
    },
    permissions: 'ADMINISTRATOR', //[] o 'PERMISO'
    requiredRoles: [],//['Math'],//Math
}