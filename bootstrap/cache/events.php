<?php return array (
  'App\\Providers\\EventServiceProvider' => 
  array (
    'App\\Events\\BillGenerated' => 
    array (
      0 => 'App\\Listeners\\SendBillGeneratedNotification',
    ),
  ),
  'Illuminate\\Foundation\\Support\\Providers\\EventServiceProvider' => 
  array (
    'App\\Events\\BillGenerated' => 
    array (
      0 => 'App\\Listeners\\SendBillGeneratedNotification@handle',
    ),
  ),
);