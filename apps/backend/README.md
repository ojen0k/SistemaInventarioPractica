<p align="center">
  Definición de las tablas de la base de datos
</p>

# 1) Estructura organizacional
``` area ``` Municipal / Salud / Educación

``` direccion ``` 1 Dirección : N Departamentos

``` departamento ``` 1 Departamento : N Oficinas

``` oficina ``` 1 Oficina : N Secciones Programa

``` seccion_programa ``` 1 Sección Programa : N Activos (Sección/Programa es el final de las sub-áreas). En asingación y préstamo se guardará el id de la sección/programa.


________________________________________
# 2) Catálogos (por editar a futuro; esta en base al excel)

``` cat_tipo_adquisicion ```: por definir
- compra agil
- convenio marco
- enviado por tecero
- licitacion
- trato directo
- ...

``` cat_modalidad ```: por definir
- arriendo
- compra
- ...

``` cat_unidad_gestora ```: Se refiere al área? por definir
- Municipal
- Salud
- Educación
- ...

``` cat_clasificacion_activo ```: por definir los activos más importantes
- computadores
- impresoras
- ...

``` cat_estado_activo ```: por definir
- En servicio
- Disponible
- ...

``` cat_cargo ```: por definir, cargo de la persona que lo usa
- Abogado
- Administrativo
- ...

``` cat_tipo_interfaz ```: por definir
- Ethernet
- Wifi
- ...

``` cat_estado_ip ```: por definir
- Asignado
- Disponible
- ...

``` cat_tipo_usabilidad ```: por definir
- Para prestamo
- cctv
- ...

``` cat_tipo_asignacion ```: por definir
- Asignacion
- Asignado
- Prestamos
- Permanente
- Reasignacion
- ...
________________________________________
# 3) Compras y proveedores

``` proveedor ```

``` compra ```

Cada compra tiene a lo más 1 proveedor (puede ser nullable) y un proveedor puede aparecer en muchas compras.
(Corroborar que por cada registro de compra hay un solo proveedor)
________________________________________
# 4) Inventario unificado (periféricos + TIC HW + equipos ETX)
``` tipo_activo ``` (Computador, Notebook, Monitor, Impresora, Periférico, etc.)

``` activo ``` (Tabla principal de inventario)

________________________________________
# 5) Asignación del activo
``` asignacion_activo ```

Historial de “dónde está / quién lo usa” (no préstamo)
________________________________________
# 6) Préstamos
``` prestamo ```

Registro de préstamo con fechas/hora y su responsable
________________________________________
# 7) Red/IP
``` interfaz_red ```
Información técnica del equipo y su interfaz

``` ip_recurso ```
Pool de IPs (asignado/disponible)

``` interfaz_ip ```
(Asignación “actual” sin historial)
1 interfaz solo puede tener 1 ip actual
1 ip solo puede estar en 1 interfaz a la vez

________________________________________
# 8) Acceso al sistema (usuarios y roles)
``` rol ```
- Administrador (1)
- Soporte (2)

``` usuario ```

``` usuario_rol ```
id_usuario =
id_rol = 1 (administrador) ó 2 (soporte)

1 usuario puede tener muchos roles
1 rol puede tener muchos usuarios

