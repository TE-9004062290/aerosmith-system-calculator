// Sony IP Microphone audience layout formulas
// 2020-12-02 Dennis Adams

void setup()
{
  //size(1024, 768);
  fullScreen();
  colorMode(RGB);
}

void draw()
{
  int screen_border = 200;
  int room_left = screen_border;
  int room_right = mouseX;
  int room_top = screen_border;
  int room_bottom = mouseY;
  int room_width = room_right - room_left;
  int room_depth = room_bottom - room_top;
  int screen_mid_x = width / 2;

  background(255); // white

  fill(200); // gray
  stroke(150); // gray
  rect(room_left, room_top, room_width, room_depth); // room for square fill 
  rect(screen_mid_x + room_left, room_top, room_width, room_depth); // room for hex fill
  
  float radius_full = 100; // radius of coverage at audience mouth height
  stroke(128, 128, 128); // gray

  /// calculate layout using square grid
  float radius_square = sin(QUARTER_PI) * radius_full; // adjust down radius for square grid with max spacing
  int nx_square = max(ceil(room_width / (radius_square * 2)), 1); // how many needed for room width
  float radius_square_x = (float)room_width / nx_square / 2; // tighter space using the integer fit
  int ny_square = max(ceil(room_depth / (radius_square * 2)), 1); // how many needed for room depth
  float radius_square_y = (float)room_depth / ny_square / 2; // tighter spacing using the integer fit
  int total_square = nx_square * ny_square; // total number needed

  /// calculate layout using square grid
  float radius_hex = cos(radians(30)) * radius_full; // adjust down radius for hex grid with max spacing
  // x
  int nx_hex_even = max(ceil(room_width / (radius_hex * 2)), 1); // how many needed for even rows (0, 2, 4, ...)
  int nx_hex_odd = max(ceil(room_width / (radius_hex * 2) + 0.5), 1); // how many needed for odd rows (1, 3, 5, ...)
  float radius_hex_x = max((float)room_width / nx_hex_even / 2, (float)room_width / (nx_hex_odd - 0.5) / 2); // tighter spacing using the integer fit
  float row_offset = radius_hex_x; // shift between rows
  // y
  float radius_hex_y = sin(radians(60)) * radius_hex; // adjust down hex radius for angled row 
  float edge_difference = radius_hex_y - radius_full/2.0; // compensate for less coverage at edges 
  int ny_hex = max(ceil((room_depth+2.0*edge_difference) / (radius_hex_y * 2)), 1); // how many are needed for room depth 
  radius_hex_y = (float)(room_depth+2.0*edge_difference) / ny_hex / 2; // tighter spacing using the integer fit
  int total_hex = floor((ny_hex+1)/2) * nx_hex_even + floor(ny_hex/2) * nx_hex_odd; // total number needed
  
  boolean square_better = total_square <= total_hex; // which layout is better?

  // draw square layout
  if (square_better)
    fill(88, 168, 88, 64);
  else
    fill(168, 88, 88, 64);
  for (int iy = 0; iy < ny_square; iy++)
  {
    for (int ix = 0; ix < nx_square; ix++)
    {
      float center_x = room_left + radius_square_x + ix * radius_square_x * 2;
      float center_y = room_top + radius_square_y + iy * radius_square_y * 2;
      circle(center_x, center_y, radius_full * 2);
    }
  }
  
  // draw hex layout
  if (square_better)
    fill(168, 88, 88, 64);
  else
    fill(88, 168, 88, 64);
  for (int iy = 0; iy < ny_hex; iy++)
  {
    boolean odd = ((iy & 1) == 1);
    int nx = odd ? nx_hex_odd : nx_hex_even;
    for (int ix = 0; ix < nx; ix++)
    {
      float center_x = screen_mid_x + room_left + radius_hex_x + ix * radius_hex_x * 2;
      if (odd)
        center_x -= row_offset;
      float center_y = room_top + radius_hex_y + iy * radius_hex_y * 2 - edge_difference;
      circle(center_x, center_y, radius_full * 2);
    }
  }
  
  // draw counts
  fill(0);
  textSize(32);
  text("Front", screen_mid_x/4, room_top/2);
  text("Side", room_left / 4, room_top * 2);
  String sSquare = str(total_square);
  text(sSquare, room_left, room_top/2);
  String sHex = str(total_hex);
  text(sHex, screen_mid_x + room_left, room_top/2);
}
