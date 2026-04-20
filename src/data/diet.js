// Dieta de Alejandro Salvador Delgado Lucero
// Nutrióloga: Lic. Angélica Palacio Escalante

const TIMES = ['7:00 AM', '10:30 AM', '1:00 PM', '6:00 PM', '8:00 PM'];
const LABELS = ['Desayuno', 'Colación', 'Comida', 'Colación', 'Cena'];
const ICONS = ['🌅', '🍎', '🍽️', '🥗', '🌙'];
const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const DIET = {
  // LUNES
  1: [
    { n: 'Huevo con jamón', d: '2 huevos · 2 rebs jamón · 2 tortillas maíz · 1 café' },
    { n: 'Gelatina light', d: '2 tzas gelatina sin azúcar · O barrita Okko + 1 manzana' },
    { n: 'Tostadas de carne molida con aguacate', d: '2 tza carnita · 1 aguacate · 4 tostadas horneadas · lechuga, tomate, crema, quesito Oaxaca, salsita' },
    { n: 'Pepino con Tajín', d: '½ pepino sin semillas con Tajín y limón' },
    { n: 'Quesadillas de queso panela', d: '4 tortillas tortiregias · 30g queso manchego u Oaxaca light' },
  ],
  // MARTES
  2: [
    { n: 'Huevo con tortilla y cebolla', d: '2 huevos · 2 tortillas maíz · cebolla · 1 café o té' },
    { n: 'Piña con canela', d: '1 tza piña con canela · O barrita Okko + 1 manzana' },
    { n: 'Ensalada César con pollo', d: '1 pechuga pollo en fajitas · mix lechugas Costco · zanahoria, tomate' },
    { n: 'Manzanas verdes con Tajín', d: '2 manzanas verdes con Tajín' },
    { n: 'Yogurt natural con frutos secos', d: '1 tza yogurt sin azúcar · 6 nueces o almendras · chía · ½ tza berries congeladas' },
  ],
  // MIÉRCOLES
  3: [
    { n: 'Huevo a la mexicana', d: '2 huevos · pico de gallo · 2 tortillas maíz · 1 café' },
    { n: 'Gelatina light', d: '2 tzas gelatina sin azúcar · O barrita Okko + 1 manzana' },
    { n: 'Salmón con sopita de fideítos', d: '1 filete salmón · 1 bowl fideítos o 2 tortiregias · ensalada mixta' },
    { n: 'Mango o fresas', d: '1 mango o 1 tza de fresas' },
    { n: 'Sandwich de jamón panela', d: '2 panes cero cero tostados · 2 rebs jamón · 1 reb queso panela' },
  ],
  // JUEVES
  4: [
    { n: 'Huevo con jamón', d: '2 huevos · 2 rebs jamón · 2 tortillas maíz · 1 café' },
    { n: 'Tostadas de aguacate', d: '2 tostadas horneadas · 1 aguacate · salsita' },
    { n: 'Ensalada César con pollo', d: '1 pechuga pollo en fajitas · mix lechugas Costco · zanahoria, tomate' },
    { n: 'Pepino con Tajín', d: '½ pepino sin semillas con Tajín y limón' },
    { n: 'Pizza healthy', d: '2 pan cero cero Bimbo tostados · puré tomate · champiñones · chile morrón · 1 reb jamón · 6 pepperonis' },
  ],
  // VIERNES
  5: [
    { n: 'Omelette', d: '2 huevos · 1 puño espinacas · 2 tortillas maíz · 1 café' },
    { n: 'Piña con canela', d: '1 tza piña con canela · O barrita Okko + 1 manzana' },
    { n: 'Milanesa con verduras', d: '1 milanesa grande o filete res · maggi y pimienta · ensalada pepino, tomate, lechuga, vinagreta balsámico' },
    { n: 'Manzanas verdes con Tajín', d: '2 manzanas verdes con Tajín' },
    { n: 'Quesadillas de queso panela', d: '4 tortillas tortiregias · 30g queso manchego u Oaxaca light' },
  ],
  // SÁBADO
  6: [
    { n: 'Huevito a la mexicana', d: '2 huevos · pico de gallo · 2 tortillas maíz · café negro o té' },
    { n: 'Gelatina light', d: '2 tzas gelatina light sin azúcar' },
    { n: 'A escoger', d: 'Sushi sin empanizar · Poke bowl · Ceviche · Coctel camarón · Aguachile' },
    { n: 'Carlos V sin azúcar', d: '1 Carlos V sin azúcar' },
    { n: 'Tostadas de aguacate', d: '1 aguacate · 4 tostadas horneadas · 1 té' },
  ],
  // DOMINGO
  0: [
    { n: 'Huevito con jamón', d: '2 huevos · 2 rebs jamón · 2 tortillas maíz · café negro o té' },
    { n: 'Gelatina light', d: '2 tzas gelatina light sin azúcar' },
    { n: 'Tacos de carne asada con aguacate', d: '1 milanesa o chuleta · 4 tortillas · 1 aguacate · panela o salsa · verduras' },
    { n: 'Fresas con Tajín', d: '5 fresas con Tajín' },
    { n: 'Yogurt natural con frutos secos', d: '1 tza yogurt sin azúcar · 6 nueces o almendras · chía · ½ tza mango congelado (tipo nieve)' },
  ],
};

