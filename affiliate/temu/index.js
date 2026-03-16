/* ============================================================
   TEMU PRODUCT INDEX
   Initialises window.TemuProducts = [] then loads all 15 category files.

   LOAD ORDER in HTML (before </body>):
     <script src="js/products/temu/index.js"></script>
     (Each category file auto-pushes into window.TemuProducts)

   OR load individual categories only:
     <script src="js/products/temu/Women.js"></script>
     <script src="js/products/temu/Electronics.js"></script>
   ============================================================ */

/* Initialise array once — category files push into it */
window.TemuProducts = [];

/* Metadata used by affiliate-main.js */
window.TemuProducts._meta = {
  platform:   'Temu',
  icon:       'fas fa-shopping-bag',
  categories: ['Women', 'Men', 'Kids', 'Shoes', 'Bags', 'Jewelry', 'Watches', 'Beauty', 'Pets', 'Toys', 'Electronics', 'Crafts', 'Home', 'Accessories', 'Flowers']
};
